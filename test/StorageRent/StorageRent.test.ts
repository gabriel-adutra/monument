import { calculateMonthlyRent, MonthlyRentRecord, MonthlyRentRecords } from "../../src/StorageRent/StorageRent";

describe("calculateMonthlyRent function", () => {
  
    it("should return MonthlyRentRecords", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00, 
                rentDueDate: new Date("2023-02-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-03-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should return MonthlyRentRecords validate first payment due date and first month pro-rate when lease start is before monthly due date", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 15;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;
    
        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);
    
        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 46.67,
                rentDueDate: new Date("2023-01-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100,
                rentDueDate: new Date("2023-01-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00, 
                rentDueDate: new Date("2023-02-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-03-15T00:00:00")
            }
        ];
    
        expect(result).toEqual(expectedResult);
      });

    it("should validate README example where rent increase is delayed due to initial vacancy", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-02-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00, 
                rentDueDate: new Date("2023-02-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-03-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should handle rent due date > days in month and lease starts before last day (proration case 1)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-02-05T00:00:00");
        const windowStartDate = new Date("2023-02-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 31;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = 0;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 76.67,
                rentDueDate: new Date("2023-02-05T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-03-31T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should handle lease starting after due date in same month (proration case 3)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-20T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-02-28T00:00:00");
        const dayOfMonthRentDue = 15;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = 0;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 83.33,
                rentDueDate: new Date("2023-01-20T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-15T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should change rent every X months based on rentRateChangeFrequency (README case)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-06-30T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 3;
        const rentChangeRate = 0.1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-03-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-04-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-05-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-06-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should decrease rent when unit is vacant (rentChangeRate negative)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-04-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = -0.1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-01T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 90.00,
                rentDueDate: new Date("2023-02-01T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 81.00,
                rentDueDate: new Date("2023-03-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should handle leap year correctly (February 2024 with 29 days)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2024-01-01T00:00:00");
        const windowStartDate = new Date("2024-02-01T00:00:00");
        const windowEndDate = new Date("2024-02-29T00:00:00");
        const dayOfMonthRentDue = 29;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = 0;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2024-02-29T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });
});
