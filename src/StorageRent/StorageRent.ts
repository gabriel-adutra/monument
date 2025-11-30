
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
    
    // Começar do primeiro mês da janela
    let currentDate = new Date(windowStartDate);
    currentDate.setDate(1); // Primeiro dia do mês
    currentDate.setHours(0, 0, 0, 0); // Zerar horas
    
    // Iterar pelos meses até o final da janela
    while (currentDate <= windowEndDate) {
        // Criar data de vencimento para este mês
        const rentDueDate = new Date(currentDate);
        rentDueDate.setDate(dayOfMonthRentDue);
        rentDueDate.setHours(0, 0, 0, 0);
        
        // Verificar se a data de vencimento está dentro da janela
        if (rentDueDate >= windowStartDate && rentDueDate <= windowEndDate) {
            // Calcular vacância: vacancy = true se rentDueDate < leaseStartDate
            const vacancy = rentDueDate < leaseStartDate;
            
            // Usar baseMonthlyRent como rentAmount (por enquanto, sem mudanças)
            const rentAmount = Math.round(baseMonthlyRent * 100) / 100; // Arredondar para 2 casas decimais
            
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
