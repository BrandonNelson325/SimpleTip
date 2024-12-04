import { EventData, Page } from '@nativescript/core';
import { TipCalculatorModel } from './main-view-model';

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new TipCalculatorModel();
}