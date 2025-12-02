export function isActiveDriver(totalAmount, percentage, status) {
    const agentAmount = (totalAmount || 0) * (percentage || 0) / 100;
    return status === 'Approved' && agentAmount >= 50;
}