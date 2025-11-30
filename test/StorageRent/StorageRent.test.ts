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

    it("should not increase rent when unit is vacant (rentChangeRate positive)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-04-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = 0.1;

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
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-01T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-03-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should not decrease rent when unit is rented (rentChangeRate negative)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2022-12-01T00:00:00");
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
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should use last day of month when dayOfMonthRentDue exceeds month days", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-02-01T00:00:00");
        const windowEndDate = new Date("2023-02-28T00:00:00");
        const dayOfMonthRentDue = 31;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = 0;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-28T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should change rent every X months based on rentRateChangeFrequency (README linha 33)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-06-30T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 2;
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
                rentAmount: 110.00,
                rentDueDate: new Date("2023-03-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-04-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-05-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-06-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should generate payment on first day of lease when lease starts after due date (README linha 16)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-20T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
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
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-03-15T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should prorate rent when lease begins after due date in same month (README linha 29)", () => {
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

    it("should prorate rent when rent due on 31st and lease begins on 5th of February (README linha 25)", () => {
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

    it("should apply rent change on next due date when change occurs between due dates (README linha 37)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
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

    it("README rule: rent change should take effect on next due date (when unit is vacant)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-03-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-04-30T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = 0.1;

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
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-03-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-04-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("README rule: rent change should take effect on next due date (example from README)", () => {
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

    it("should handle leap year correctly (February with 29 days)", () => {
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

    it("should round rent amount to two decimal places correctly", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = 0.333333;

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
                rentAmount: 133.33,
                rentDueDate: new Date("2023-02-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 177.78,
                rentDueDate: new Date("2023-03-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should change rent every 3 months based on rentRateChangeFrequency", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-09-30T00:00:00");
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
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-07-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-08-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-09-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should handle proration with frequency > 1 (complex combination)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-05T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-05-31T00:00:00");
        const dayOfMonthRentDue = 15;
        const rentRateChangeFrequency = 2;
        const rentChangeRate = 0.1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 33.33,
                rentDueDate: new Date("2023-01-05T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-03-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-04-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-05-15T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should handle window starting after lease begins (generic case)", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-03-01T00:00:00");
        const windowEndDate = new Date("2023-05-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = 0.1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
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
                rentAmount: 121.00,
                rentDueDate: new Date("2023-05-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });
});
