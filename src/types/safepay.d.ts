declare global {
    interface Window {
        safepay?: {
            setup: (config: { environment: string; apiKey: string; vpay?: boolean }) => void;
            checkout: (config: {
                amount: number;
                currency: string;
                token: string;
                track: string;
                onPayment?: (data: any) => void;
                onClose?: () => void;
                onCheckout?: (data: any) => void;
            }) => {
                open: () => void;
                close: () => void;
            };
        };
    }
}

export { };
