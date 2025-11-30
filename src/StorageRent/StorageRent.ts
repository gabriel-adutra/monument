
export type MonthlyRentRecord = {
    vacancy: boolean,
    rentAmount: number,
    rentDueDate: Date
}

export type MonthlyRentRecords = Array<MonthlyRentRecord>;

/**
 * Determines the vacancy, rent amount and due date for each month in a given time window
 * 
 * @param baseMonthlyRent : The base or starting monthly rent for unit (Number)
 * @param leaseStartDate : The date that the tenant's lease starts (Date)
 * @param windowStartDate : The first date of the given time window (Date)
 * @param windowEndDate : The last date of the given time window (Date)
 * @param dayOfMonthRentDue : The day of each month on which rent is due (Number)
 * @param rentRateChangeFrequency : The frequency in months the rent is changed (Number)
 * @param rentChangeRate : The rate to increase or decrease rent, input as decimal (not %), positive for increase, negative for decrease (Number),
 * @returns Array<MonthlyRentRecord>;
 */
export function calculateMonthlyRent(baseMonthlyRent: number, leaseStartDate: Date, windowStartDate: Date, 
    windowEndDate: Date, dayOfMonthRentDue: number, rentRateChangeFrequency: number, rentChangeRate: number) {

    const monthlyRentRecords : MonthlyRentRecords = [];
    
    // Calcular a data base para mudanças de rent (primeiro dia do mês de windowStartDate)
    const rentChangeBaseDate = new Date(windowStartDate);
    rentChangeBaseDate.setDate(1);
    rentChangeBaseDate.setHours(0, 0, 0, 0);
    
    // Rent atual começa com baseMonthlyRent
    let currentRent = baseMonthlyRent;
    
    // Começar do primeiro mês da janela
    let currentDate = new Date(windowStartDate);
    currentDate.setDate(1); // Primeiro dia do mês
    currentDate.setHours(0, 0, 0, 0); // Zerar horas
    
    // Iterar pelos meses até o final da janela
    while (currentDate <= windowEndDate) {
        // Verificar se a rent deve mudar neste mês
        // Mudanças ocorrem a cada rentRateChangeFrequency meses a partir de rentChangeBaseDate
        const monthsSinceBase = (currentDate.getFullYear() - rentChangeBaseDate.getFullYear()) * 12 + 
                                (currentDate.getMonth() - rentChangeBaseDate.getMonth());
        
        // Se passou pelo menos uma frequência desde a última mudança, aplicar nova mudança
        if (monthsSinceBase > 0 && monthsSinceBase % rentRateChangeFrequency === 0) {
            currentRent = calculateNewMonthlyRent(currentRent, rentChangeRate);
        }
        
        // Criar data de vencimento para este mês
        const rentDueDate = new Date(currentDate);
        const year = rentDueDate.getFullYear();
        const month = rentDueDate.getMonth();
        const lastDayOfMonth = getLastDayOfMonth(year, month);
        
        // Se o dia especificado é maior que os dias do mês, usar o último dia do mês
        const dayToUse = dayOfMonthRentDue > lastDayOfMonth ? lastDayOfMonth : dayOfMonthRentDue;
        rentDueDate.setDate(dayToUse);
        rentDueDate.setHours(0, 0, 0, 0);
        
        // Verificar se a data de vencimento está dentro da janela
        if (rentDueDate >= windowStartDate && rentDueDate <= windowEndDate) {
            // Calcular vacância: vacancy = true se rentDueDate < leaseStartDate
            const vacancy = rentDueDate < leaseStartDate;
            
            // Usar currentRent como rentAmount
            const rentAmount = Math.round(currentRent * 100) / 100; // Arredondar para 2 casas decimais
            
            monthlyRentRecords.push({
                vacancy: vacancy,
                rentAmount: rentAmount,
                rentDueDate: new Date(rentDueDate)
            });
        }
        
        // Avançar para o próximo mês
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return monthlyRentRecords;    
}

/**
 * Calculates the new monthly rent
 * 
 * @param baseMonthlyRent : the base amount of rent
 * @param rentChangeRate : the rate that rent my increase or decrease (positive for increase, negative for decrease)
 * @returns number
 * 
 */
function calculateNewMonthlyRent(baseMonthlyRent: number, rentChangeRate: number) {
    return baseMonthlyRent * (1 + rentChangeRate);
}

/**
 * Determines if the year is a leap year
 * 
 * @param year 
 * @returns boolean
 * 
 */
function isLeapYear(year: number) {
    return (year % 4 == 0 && year % 100 != 0);
}

/**
 * Gets the last day of a given month
 * 
 * @param year 
 * @param month (0-11, where 0 = January, 11 = December)
 * @returns number
 * 
 */
function getLastDayOfMonth(year: number, month: number): number {
    // February (month 1)
    if (month === 1) {
        return isLeapYear(year) ? 29 : 28;
    }
    // Months with 31 days: January, March, May, July, August, October, December
    if ([0, 2, 4, 6, 7, 9, 11].includes(month)) {
        return 31;
    }
    // Months with 30 days: April, June, September, November
    return 30;
}
