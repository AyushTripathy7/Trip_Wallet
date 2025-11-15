
import { Trip, Settlement } from '../types';
import { calculateSettlements } from '../utils/settlement';

declare const jspdf: any;

export const generateTripReport = (trip: Trip) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    const totalContributions = trip.contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalContributions - totalExpenses;

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    // Header
    doc.setFontSize(22);
    doc.text(`Trip Report: ${trip.name}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    // Summary
    doc.setFontSize(18);
    doc.text('Financial Summary', 14, 40);
    doc.autoTable({
        startY: 45,
        body: [
            ['Total Collected', formatCurrency(totalContributions)],
            ['Total Expenses', formatCurrency(totalExpenses)],
            ['Remaining Balance', formatCurrency(balance)],
        ],
        theme: 'striped',
        styles: { fontSize: 12 },
    });

    // Contributions
    const memberContributionsMap = new Map<string, number>();
    trip.contributions.forEach(c => {
        memberContributionsMap.set(c.memberId, (memberContributionsMap.get(c.memberId) || 0) + c.amount);
    });
    
    const contributionsBody = trip.members.map(member => [
        member.name,
        formatCurrency(memberContributionsMap.get(member.id) || 0)
    ]);
    doc.addPage();
    doc.setFontSize(18);
    doc.text('Contributions per Member', 14, 20);
    doc.autoTable({
        startY: 25,
        head: [['Member', 'Amount Contributed']],
        body: contributionsBody,
        theme: 'striped',
    });

    // Expenses
    const expenseBody = trip.expenses.map(exp => [
        new Date(exp.date).toLocaleDateString(),
        exp.title,
        exp.category,
        formatCurrency(exp.amount),
        trip.members.find(m => m.id === exp.paidBy)?.name || 'N/A'
    ]);
    doc.setFontSize(18);
    doc.text('Expense Details', 14, doc.autoTable.previous.finalY + 15);
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 20,
        head: [['Date', 'Title', 'Category', 'Amount', 'Paid By']],
        body: expenseBody,
        theme: 'striped',
    });
    
    // Settlement
    const memberExpensesMap = new Map<string, number>();
    trip.expenses.forEach(e => {
        memberExpensesMap.set(e.paidBy, (memberExpensesMap.get(e.paidBy) || 0) + e.amount);
    });
    const settlements: Settlement[] = calculateSettlements(trip, totalExpenses, memberContributionsMap, memberExpensesMap);
    
    const settlementBody = settlements.map(s => [
        s.from,
        s.to,
        formatCurrency(s.amount)
    ]);
    doc.addPage();
    doc.setFontSize(18);
    doc.text('Settlement Summary', 14, 20);
    doc.autoTable({
        startY: 25,
        head: [['Who Owes', 'Who Gets Paid', 'Amount']],
        body: settlementBody.length > 0 ? settlementBody : [['Everyone is settled up!', '', '']],
        theme: 'grid',
    });


    // Luggage List
    const luggageBody = trip.luggage.map(item => [
        item.name,
        item.category,
        item.packed ? 'Yes' : 'No',
        trip.members.find(m => m.id === item.addedBy)?.name || 'N/A'
    ]);
    doc.setFontSize(18);
    doc.text('Packing List', 14, doc.autoTable.previous.finalY + 15);
    doc.autoTable({
        startY: doc.autoTable.previous.finalY + 20,
        head: [['Item', 'Category', 'Packed', 'Added By']],
        body: luggageBody,
        theme: 'striped',
    });


    doc.save(`${trip.name.replace(' ', '_')}_Report.pdf`);
};
