
export type MonthlyRentRecord = {
    vacancy: boolean,
    rentAmount: number,
    rentDueDate: Date
}

export type MonthlyRentRecords = Array<MonthlyRentRecord>;

const DAYS_IN_PRORATION_MONTH = 30;

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
export function calculateMonthlyRent(baseMonthlyRent: number, leaseStartDate: Date, windowStartDate: Date, windowEndDate: Date, dayOfMonthRentDue: number, rentRateChangeFrequency: number, rentChangeRate: number): MonthlyRentRecords {

    //(1)
    const monthlyRentRecords: MonthlyRentRecords = [];
    const normalizedLeaseStart = normalizeDate(leaseStartDate);
    const rentChangeBaseDate = getFirstDayOfMonth(windowStartDate); //reference point to count how many months have passed. Based on this count, the system knows when a rent change should be applied.
    let currentRent = baseMonthlyRent;

    // Handle prorated rent for lease start date
    const proratedRecord = calculateProratedRentIfNeeded(normalizedLeaseStart, dayOfMonthRentDue, currentRent, windowStartDate, windowEndDate);

    if (proratedRecord) {
        monthlyRentRecords.push(proratedRecord);
    }

    //(2) 
    let currentDate = getFirstDayOfMonth(windowStartDate);
    let previousVacancy: boolean | null = null;
    //(3)
    while (currentDate <= windowEndDate) {
        const rentDueDate = createRentDueDate(currentDate, dayOfMonthRentDue);
        //(4)
        if (isDateInWindow(rentDueDate, windowStartDate, windowEndDate)) {
            if (!shouldSkipDueDate(rentDueDate, normalizedLeaseStart, dayOfMonthRentDue)) {
                const vacancy = isVacant(rentDueDate, normalizedLeaseStart);
                
                //(5)
                const monthsSinceBase = calculateMonthsBetween(rentChangeBaseDate, currentDate);
                if (shouldApplyRentChange(monthsSinceBase, rentRateChangeFrequency)) {
                    // Use previousVacancy if available, otherwise use current vacancy
                    const vacancyToCheck = previousVacancy !== null ? previousVacancy : vacancy;
                    
                    if (canApplyRentChange(rentChangeRate, vacancyToCheck)) {
                        currentRent = calculateNewMonthlyRent(currentRent, rentChangeRate);
                    }
                }
                //(6)
                const rentAmount = roundToTwoDecimals(currentRent);
                monthlyRentRecords.push({vacancy, rentAmount, rentDueDate: new Date(rentDueDate)});
                
                previousVacancy = vacancy;
            }
        }
        //(7)
        currentDate = getNextMonth(currentDate);
    }

    return monthlyRentRecords;
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Normalizes a date by setting hours, minutes, seconds, and milliseconds to 0
 */
function normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

/**
 * Gets the first day of the month for a given date
 */
function getFirstDayOfMonth(date: Date): Date {
    const firstDay = new Date(date);
    firstDay.setDate(1);
    firstDay.setHours(0, 0, 0, 0);
    return firstDay;
}

/**
 * Gets the next month from a given date
 */
function getNextMonth(date: Date): Date {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
}

/**
 * Creates a rent due date for a given month, handling cases where dayOfMonthRentDue
 * exceeds the number of days in the month
 */
function createRentDueDate(monthStart: Date, dayOfMonthRentDue: number): Date {
    const rentDueDate = new Date(monthStart);
    const year = rentDueDate.getFullYear();
    const month = rentDueDate.getMonth();
    const lastDayOfMonth = getLastDayOfMonth(year, month);
    const dayToUse = dayOfMonthRentDue > lastDayOfMonth ? lastDayOfMonth : dayOfMonthRentDue;
    rentDueDate.setDate(dayToUse);
    return normalizeDate(rentDueDate);
}

/**
 * Checks if a date is within the window boundaries
 */
function isDateInWindow(date: Date, windowStart: Date, windowEnd: Date): boolean {
    return date >= windowStart && date <= windowEnd;
}

// ============================================================================
// Proration Logic
// ============================================================================

/**
 * Calculates prorated rent if the lease starts within the window and requires proration
 */
function calculateProratedRentIfNeeded(leaseStartDate: Date, dayOfMonthRentDue: number, currentRent: number, windowStartDate: Date, windowEndDate: Date): MonthlyRentRecord | null {
    if (!isDateInWindow(leaseStartDate, windowStartDate, windowEndDate)) {
        return null;
    }

    const leaseYear = leaseStartDate.getFullYear();
    const leaseMonth = leaseStartDate.getMonth();
    const leaseDay = leaseStartDate.getDate();
    const lastDayOfLeaseMonth = getLastDayOfMonth(leaseYear, leaseMonth);
    const firstMonthRentDueDate = normalizeDate(new Date(leaseYear, leaseMonth, dayOfMonthRentDue));

    // Case 1: Rent due date exceeds month days and lease starts before last day
    if (dayOfMonthRentDue > lastDayOfLeaseMonth && leaseDay < lastDayOfLeaseMonth) {
        const proratedAmount = calculateProratedAmount(
            currentRent,
            lastDayOfLeaseMonth - leaseDay,
            DAYS_IN_PRORATION_MONTH
        );
        return createProratedRecord(proratedAmount, leaseStartDate);
    }

    // Case 2: Lease starts before due date in same month
    if (leaseDay < dayOfMonthRentDue && leaseStartDate < firstMonthRentDueDate) {
        const proratedAmount = calculateProratedAmount(
            currentRent,
            dayOfMonthRentDue - leaseDay,
            DAYS_IN_PRORATION_MONTH
        );
        return createProratedRecord(proratedAmount, leaseStartDate);
    }

    // Case 3: Lease starts after due date in same month
    if (leaseDay > dayOfMonthRentDue && leaseStartDate > firstMonthRentDueDate) {
        const daysAfterDueDate = leaseDay - dayOfMonthRentDue;
        const proratedAmount = calculateRemainingProratedAmount(currentRent, daysAfterDueDate, DAYS_IN_PRORATION_MONTH);
        return createProratedRecord(proratedAmount, leaseStartDate);
    }

    return null;
}

/**
 * Calculates prorated amount based on days and monthly rent
 */
function calculateProratedAmount(monthlyRent: number, days: number, daysInMonth: number): number {
    return (monthlyRent * days) / daysInMonth;
}

/**
 * Calculates remaining prorated amount after due date
 * Formula: monthlyRent * (1 - daysAfter / daysInMonth)
 */
function calculateRemainingProratedAmount(monthlyRent: number, daysAfter: number, daysInMonth: number): number {
    return monthlyRent * (1 - daysAfter / daysInMonth);
}

/**
 * Creates a prorated rent record
 */
function createProratedRecord(proratedAmount: number, dueDate: Date): MonthlyRentRecord {
    return {
        vacancy: false,
        rentAmount: roundToTwoDecimals(proratedAmount),
        rentDueDate: new Date(dueDate)
    };
}

// ============================================================================
// Vacancy Logic
// ============================================================================

/**
 * Determines if a unit is vacant on a given rent due date
 */
function isVacant(rentDueDate: Date, leaseStartDate: Date): boolean {
    return rentDueDate < leaseStartDate;
}

/**
 * Checks if a due date should be skipped because lease starts after it in the same month
 */
function shouldSkipDueDate(rentDueDate: Date, leaseStartDate: Date, dayOfMonthRentDue: number): boolean {
    const isSameMonthAsLease = rentDueDate.getFullYear() === leaseStartDate.getFullYear() && rentDueDate.getMonth() === leaseStartDate.getMonth();

    if (!isSameMonthAsLease) {
        return false;
    }

    const leaseStartsAfterDueDate = leaseStartDate > rentDueDate;
    if (leaseStartsAfterDueDate) {
        return true;
    }

    // Case 3.1: Rent due date exceeds month days and lease starts before last day
    const year = rentDueDate.getFullYear();
    const month = rentDueDate.getMonth();
    const lastDayOfMonth = getLastDayOfMonth(year, month);
    const isCase31 = dayOfMonthRentDue > lastDayOfMonth &&
                    leaseStartDate.getDate() < lastDayOfMonth;
    return isCase31;
}

// ============================================================================
// Rent Change Logic
// ============================================================================

/**
 * Calculates the number of months between two dates
 */
function calculateMonthsBetween(startDate: Date, endDate: Date): number {
    return (endDate.getFullYear() - startDate.getFullYear()) * 12 +
           (endDate.getMonth() - startDate.getMonth());
}

/**
 * Determines if rent change should be applied based on frequency
 */
function shouldApplyRentChange(monthsSinceBase: number, rentRateChangeFrequency: number): boolean {
    return monthsSinceBase > 0 && monthsSinceBase % rentRateChangeFrequency === 0;
}

/**
 * Determines if rent change can be applied based on vacancy rules
 */
function canApplyRentChange(rentChangeRate: number, vacancy: boolean): boolean {
    const canIncrease = rentChangeRate > 0 && !vacancy;
    const canDecrease = rentChangeRate < 0 && vacancy;
    return canIncrease || canDecrease;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculates the new monthly rent
 * 
 * @param currentRent : the current amount of rent
 * @param rentChangeRate : the rate that rent my increase or decrease (positive for increase, negative for decrease)
 * @returns number
 * 
 */
function calculateNewMonthlyRent(currentRent: number, rentChangeRate: number) {
    return currentRent * (1 + rentChangeRate);
}

/**
 * Rounds a number to two decimal places
 */
function roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
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
