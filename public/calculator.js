function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function calculateMonthlyPayment(principal, rate, years) {
    const monthlyRate = rate / 100 / 12;
    const payments = years * 12;
    if (monthlyRate === 0) return principal / payments;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
}

function getTransferTaxRate(region, propertyType) {
    if (propertyType === 'newbuild') {
        return 0;
    }
    
    const rates = {
        'madrid': 0.065,
        'catalonia': 0.10,
        'valencia': 0.08,
        'andalusia': 0.08,
        'other': 0.08
    };
    return rates[region] || 0.08;
}

function calculate() {
    try {
        const netSalary = parseFloat(document.getElementById('netSalary').value) || 0;
        const savings = parseFloat(document.getElementById('savings').value) || 0;
        const familyHelp = parseFloat(document.getElementById('familyHelp').value) || 0;
        const ltv = parseFloat(document.getElementById('ltv').value) || 0;
        const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
        const mortgageTerm = parseFloat(document.getElementById('mortgageTerm').value) || 25;
        const propertyPrice = parseFloat(document.getElementById('propertyPrice').value) || 0;
        const propertyType = document.getElementById('propertyType').value;
        const region = document.getElementById('region').value;
        const furnitureBudget = parseFloat(document.getElementById('furnitureBudget').value) || 0;
        const yearsBeforeSale = parseFloat(document.getElementById('yearsBeforeSale').value) || 0;
        const priceInflation = parseFloat(document.getElementById('priceInflation').value) || 0;
        
        // Living costs inputs
        const homeInsurance = parseFloat(document.getElementById('homeInsurance').value) || 0;
        const propertyTax = parseFloat(document.getElementById('propertyTax').value) || 0;
        const communityFees = parseFloat(document.getElementById('communityFees').value) || 0;
        const maintenance = parseFloat(document.getElementById('maintenance').value) || 0;
        const salesCostsPercent = parseFloat(document.getElementById('salesCosts').value) || 0;
        const monthlyRent = parseFloat(document.getElementById('monthlyRent').value) || 0;

        const monthlyIncome = netSalary / 12;
        const maxAffordableMonthly = monthlyIncome * 0.35;
        
        // Calculate max mortgage from income using proper loan formula
        let maxMortgageFromIncome = 0;
        if (interestRate > 0 && maxAffordableMonthly > 0) {
            const monthlyRate = interestRate / 100 / 12;
            const numPayments = mortgageTerm * 12;
            maxMortgageFromIncome = maxAffordableMonthly * ((Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments)));
        } else if (maxAffordableMonthly > 0) {
            maxMortgageFromIncome = maxAffordableMonthly * mortgageTerm * 12;
        }

        // Mortgage amount = Lower of property price * LTV and maximum mortgage from income
        const ltvAmount = propertyPrice * (ltv / 100);
        const maxMortgage = Math.min(ltvAmount, maxMortgageFromIncome);
        const mortgageAmount = maxMortgage;

        // Total funds = savings + family help + mortgage
        const totalFunds = savings + familyHelp + mortgageAmount;

        // Calculate all costs
        let transferTax = 0;
        let stampDuty = 0;
        
        if (propertyType === 'newbuild') {
            transferTax = propertyPrice * 0.10; // 10% VAT
            stampDuty = propertyPrice * 0.0125; // 1.25% stamp duty
        } else {
            const transferTaxRate = getTransferTaxRate(region, propertyType);
            transferTax = propertyPrice * transferTaxRate;
            stampDuty = 0;
        }

        const notaryFees = Math.max(800, propertyPrice * 0.003);
        const legalFees = propertyPrice * 0.01;
        const registrationFees = propertyPrice * 0.0015;
        const nieDocuments = propertyPrice * 0.0007;
        const valuationFee = 400;
        const surveyFee = 500;
        const mortgageArrangementFee = mortgageAmount > 0 ? mortgageAmount * 0.01 : 0;
        const bankCharges = 800;
        const buildingSurvey = 600;
        const mortgageInsurance = 400;
        const landRegistry = 150;
        const depositProtection = 200;
        const taxAdvice = 400;
        const contingency = propertyPrice * 0.02;

        const totalPurchaseFees = transferTax + stampDuty + notaryFees + legalFees + registrationFees + nieDocuments + valuationFee + surveyFee + mortgageArrangementFee + bankCharges + buildingSurvey + mortgageInsurance + landRegistry + depositProtection + taxAdvice + contingency;
        const totalCost = propertyPrice + totalPurchaseFees + furnitureBudget;

        const difference = totalFunds - totalCost;
        const isAffordable = difference >= 0;

        const monthlyPayment = mortgageAmount > 0 ? calculateMonthlyPayment(mortgageAmount, interestRate, mortgageTerm) : 0;
        const incomeRatio = monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0;
        const maxRecommended = monthlyIncome * 0.35;
        const remainingIncome = monthlyIncome - monthlyPayment;

        // Cashflow Analysis Calculations - CORRECTED INITIAL INVESTMENT
        // Initial Investment = Total Cost - Mortgage Amount (what you actually pay upfront)
        const initialInvestment = totalCost - mortgageAmount;
        
        const totalMortgagePayments = monthlyPayment * 12 * yearsBeforeSale;
        const annualLivingCosts = homeInsurance + propertyTax + communityFees + maintenance;
        const totalLivingCosts = annualLivingCosts * yearsBeforeSale;
        const totalCashOutflow = initialInvestment + totalMortgagePayments + totalLivingCosts;

        // Future property value using user-defined inflation rate
        const annualAppreciation = priceInflation / 100;
        const futureValue = propertyPrice * Math.pow(1 + annualAppreciation, yearsBeforeSale);

        // Sales costs as percentage of future value
        const salesCosts = futureValue * (salesCostsPercent / 100);

        // Remaining mortgage calculation (simplified)
        const totalPrincipalPayments = totalMortgagePayments * 0.7; // Approximate principal portion
        const remainingMortgage = Math.max(0, mortgageAmount - totalPrincipalPayments);

        // Capital gains calculation
        const capitalGain = Math.max(0, futureValue - propertyPrice - totalPurchaseFees - salesCosts);
        const capitalGainsTax = capitalGain * 0.19; // 19% rate

        const netProceeds = futureValue - remainingMortgage - salesCosts - capitalGainsTax;
        const netCashFromBuying = netProceeds - totalCashOutflow;

        // Rental calculation
        const cashOutflowFromRenting = monthlyRent * 12 * yearsBeforeSale;

        // Financial advantage (negative = buying is better, positive = renting is better)
        const financialAdvantage = cashOutflowFromRenting - Math.abs(netCashFromBuying);

        // Update main results
        document.getElementById('totalFunds').textContent = formatCurrency(totalFunds);
        document.getElementById('totalCost').textContent = formatCurrency(totalCost);
        document.getElementById('affordabilityResult').textContent = formatCurrency(Math.abs(difference));
        
        const affordabilityBox = document.getElementById('affordabilityBox');
        const affordabilityLabel = document.getElementById('affordabilityLabel');
        
        if (isAffordable) {
            affordabilityBox.className = 'result-box affordability-result affordable';
            affordabilityLabel.textContent = 'Surplus Available';
        } else {
            affordabilityBox.className = 'result-box affordability-result not-affordable';
            affordabilityLabel.textContent = 'Additional Funds Needed';
        }

        // Buy vs Rent Decision 
        // Default to RENT if there's a funding shortfall for buying
        const buyRentBox = document.getElementById('buyRentBox');
        const buyRentDecision = document.getElementById('buyRentDecision');
        
        if (!isAffordable) {
            // Can't afford to buy, so recommend rent
            buyRentBox.className = 'result-box buy-rent-decision rent-decision';
            buyRentDecision.textContent = 'RENT';
        } else if (Math.abs(netCashFromBuying) < cashOutflowFromRenting) {
            // Can afford to buy and buying is financially better
            buyRentBox.className = 'result-box buy-rent-decision buy-decision';
            buyRentDecision.textContent = 'BUY';
        } else {
            // Can afford to buy but renting is financially better
            buyRentBox.className = 'result-box buy-rent-decision rent-decision';
            buyRentDecision.textContent = 'RENT';
        }

        // Update breakdowns
        document.getElementById('savingsBreakdown').textContent = formatCurrency(savings);
        document.getElementById('familyBreakdown').textContent = formatCurrency(familyHelp);
        document.getElementById('mortgageBreakdown').textContent = formatCurrency(mortgageAmount);
        document.getElementById('totalAvailableBreakdown').textContent = formatCurrency(totalFunds);
        
        document.getElementById('propertyPriceBreakdown').textContent = formatCurrency(propertyPrice);
        document.getElementById('purchaseFeesBreakdown').textContent = formatCurrency(totalPurchaseFees);
        document.getElementById('furnitureBreakdown').textContent = formatCurrency(furnitureBudget);
        document.getElementById('totalRequiredBreakdown').textContent = formatCurrency(totalCost);

        // Update monthly payment info
        document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
        document.getElementById('incomeRatio').textContent = incomeRatio.toFixed(1) + '%';
        document.getElementById('maxRecommended').textContent = formatCurrency(maxRecommended);
        document.getElementById('remainingIncome').textContent = formatCurrency(remainingIncome);

        // Update detailed costs
        document.getElementById('transferTax').textContent = formatCurrency(transferTax);
        document.getElementById('stampDuty').textContent = formatCurrency(stampDuty);
        document.getElementById('notaryFees').textContent = formatCurrency(notaryFees);
        document.getElementById('legalFees').textContent = formatCurrency(legalFees);
        document.getElementById('registrationFees').textContent = formatCurrency(registrationFees);
        document.getElementById('nieDocuments').textContent = formatCurrency(nieDocuments);
        document.getElementById('valuationFee').textContent = formatCurrency(valuationFee);
        document.getElementById('surveyFee').textContent = formatCurrency(surveyFee);
        document.getElementById('mortgageArrangement').textContent = formatCurrency(mortgageArrangementFee);
        document.getElementById('contingency').textContent = formatCurrency(contingency);
        document.getElementById('totalPurchaseFees').textContent = formatCurrency(totalPurchaseFees);

        // Update cashflow analysis - CORRECTED INITIAL INVESTMENT
        document.getElementById('initialInvestment').textContent = formatCurrency(initialInvestment);
        document.getElementById('totalMortgagePayments').textContent = formatCurrency(totalMortgagePayments);
        document.getElementById('totalLivingCosts').textContent = formatCurrency(totalLivingCosts);
        document.getElementById('totalCashOutflow').textContent = formatCurrency(totalCashOutflow);
        document.getElementById('yearsDisplay').textContent = yearsBeforeSale;
        document.getElementById('futureValue').textContent = formatCurrency(futureValue);
        document.getElementById('remainingMortgage').textContent = '-' + formatCurrency(remainingMortgage);
        document.getElementById('salesCostsDisplay').textContent = '-' + formatCurrency(salesCosts);
        document.getElementById('capitalGainsTaxAmount').textContent = '-' + formatCurrency(capitalGainsTax);
        document.getElementById('netProceeds').textContent = formatCurrency(netProceeds);
        document.getElementById('netCashFromBuying').textContent = formatCurrency(netCashFromBuying);
        document.getElementById('cashOutflowFromRenting').textContent = '-' + formatCurrency(cashOutflowFromRenting);
        document.getElementById('financialAdvantage').textContent = formatCurrency(financialAdvantage);

        // Update capital gains calculation
        document.getElementById('proceedsFromSale').textContent = formatCurrency(futureValue);
        document.getElementById('lessHomePrice').textContent = '-' + formatCurrency(propertyPrice);
        document.getElementById('lessPurchaseCosts').textContent = '-' + formatCurrency(totalPurchaseFees);
        document.getElementById('lessSalesCosts').textContent = '-' + formatCurrency(salesCosts);
        document.getElementById('netGain').textContent = formatCurrency(capitalGain);
        document.getElementById('capitalGainsTaxTotal').textContent = formatCurrency(capitalGainsTax);

    } catch (error) {
        console.error('Calculation error:', error);
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    calculate();
});

// Also try to initialize immediately in case DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', calculate);
} else {
    calculate();
}
