import { Observable } from '@nativescript/core';

export class TipCalculatorModel extends Observable {
    private _billAmount: string = '';
    private _tipPercentage: number = 18;
    private _tipAmount: string = '$0.00';
    private _totalAmount: string = '$0.00';

    constructor() {
        super();
        this.calculateTip();
    }

    get billAmount(): string {
        return this._billAmount ? `$${this._billAmount}` : '';
    }

    private setBillAmount(value: string) {
        if (this._billAmount !== value) {
            this._billAmount = value;
            this.notifyPropertyChange('billAmount', this.billAmount);
            this.calculateTip();
        }
    }

    get tipPercentage(): number {
        return this._tipPercentage;
    }

    set tipPercentage(value: number) {
        try {
            const newValue = Math.round(Number(value));
            if (!isNaN(newValue) && newValue >= 0 && newValue <= 30 && this._tipPercentage !== newValue) {
                this._tipPercentage = newValue;
                this.notifyPropertyChange('tipPercentage', newValue);
                this.calculateTip();
            }
        } catch (error) {
            console.error('Error in tipPercentage setter:', error);
            this._tipPercentage = 18;
            this.notifyPropertyChange('tipPercentage', 18);
            this.calculateTip();
        }
    }

    get tipAmount(): string {
        return this._tipAmount;
    }

    set tipAmount(value: string) {
        if (this._tipAmount !== value) {
            this._tipAmount = value;
            this.notifyPropertyChange('tipAmount', value);
        }
    }

    get totalAmount(): string {
        return this._totalAmount;
    }

    set totalAmount(value: string) {
        if (this._totalAmount !== value) {
            this._totalAmount = value;
            this.notifyPropertyChange('totalAmount', value);
        }
    }

    onKeyPress(args: any) {
        const button = args.object;
        const key = button.text;

        // Don't allow multiple decimal points
        if (key === '.' && this._billAmount.includes('.')) {
            return;
        }

        // Limit to 2 decimal places
        if (this._billAmount.includes('.')) {
            const [, decimal] = this._billAmount.split('.');
            if (decimal && decimal.length >= 2) {
                return;
            }
        }

        // Limit the total length of the number
        if (this._billAmount.length >= 8) {
            return;
        }

        // Don't allow leading zeros unless it's a decimal
        if (this._billAmount === '0' && key !== '.') {
            this.setBillAmount(key);
            return;
        }

        this.setBillAmount(this._billAmount + key);
    }

    onBackspace() {
        if (this._billAmount.length > 0) {
            this.setBillAmount(this._billAmount.slice(0, -1));
        }
    }

    setTip16() {
        this.tipPercentage = 16;
    }

    setTip18() {
        this.tipPercentage = 18;
    }

    setTip20() {
        this.tipPercentage = 20;
    }

    onClear() {
        this.setBillAmount('');
        this.tipPercentage = 18;
        this.calculateTip();
    }

    private calculateTip() {
        try {
            const bill = parseFloat(this._billAmount) || 0;
            const tipPercent = this._tipPercentage / 100;
            
            if (isNaN(bill) || isNaN(tipPercent)) {
                throw new Error('Invalid numbers for calculation');
            }

            const tip = bill * tipPercent;
            const total = bill + tip;

            if (isNaN(tip) || isNaN(total)) {
                throw new Error('Invalid calculation result');
            }

            this.tipAmount = `$${tip.toFixed(2)}`;
            this.totalAmount = `$${total.toFixed(2)}`;
        } catch (error) {
            console.error('Error in calculateTip:', error);
            this.tipAmount = '$0.00';
            this.totalAmount = '$0.00';
        }
    }
}