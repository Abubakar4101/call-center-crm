export function isActiveDriver(totalAmount, percentage, status) {
    const agentAmount = (totalAmount || 0) * (percentage || 0) / 100;
    return status === 'Approved' && agentAmount >= 50;
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}