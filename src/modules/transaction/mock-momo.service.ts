export class MockMomoService {
    /**
     * Simulates initiating a payment request to the user's phone number.
     * In reality, this would call the MTN/Orange API and wait for a callback.
     */
    async initiatePayment(phoneNumber: string, amount: number, provider: 'MTN_MOMO' | 'ORANGE_MOMO'): Promise<{ success: boolean; reference: string; message: string }> {
        // Generate a fake unique reference
        const reference = `REF-${provider}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For testing purposes, we'll say any phone number starting with "fail" fails.
        if (phoneNumber.startsWith('fail')) {
            return {
                success: false,
                reference,
                message: 'Payment failed due to insufficient funds or user cancellation.'
            };
        }

        return {
            success: true,
            reference,
            message: 'Payment processed successfully.'
        };
    }

    /**
     * Simulates transferring money from the company account to the Agronomist's phone number.
     */
    async processWithdrawal(phoneNumber: string, amount: number, provider: 'MTN_MOMO' | 'ORANGE_MOMO'): Promise<{ success: boolean; reference: string; message: string }> {
        const reference = `WD-${provider}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (phoneNumber.startsWith('fail')) {
            return {
                success: false,
                reference,
                message: 'Withdrawal transfer failed.'
            };
        }

        return {
            success: true,
            reference,
            message: 'Withdrawal processed successfully.'
        };
    }
}
