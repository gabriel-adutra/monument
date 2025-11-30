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
        // Lease começa depois da janela, então todas as datas têm vacancy = true
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-04-01T00:00:00"); // Lease começa depois
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = 0.1; // Tentativa de aumento de 10%

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        // Rent não deve aumentar porque unidade está vazia (vacancy = true)
        let expectedResult = [
            {
                vacancy: true,
                rentAmount: 100.00, // Permanece 100, não aumenta para 110
                rentDueDate: new Date("2023-01-01T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 100.00, // Permanece 100, não aumenta para 110
                rentDueDate: new Date("2023-02-01T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 100.00, // Permanece 100, não aumenta para 110
                rentDueDate: new Date("2023-03-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should not decrease rent when unit is rented (rentChangeRate negative)", () => {
        // Lease começa antes da janela, então todas as datas têm vacancy = false
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2022-12-01T00:00:00"); // Lease começa antes
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = -0.1; // Tentativa de diminuição de 10%

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        // Rent não deve diminuir porque unidade está ocupada (vacancy = false)
        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 100.00, // Permanece 100, não diminui para 90
                rentDueDate: new Date("2023-01-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00, // Permanece 100, não diminui para 90
                rentDueDate: new Date("2023-02-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00, // Permanece 100, não diminui para 90
                rentDueDate: new Date("2023-03-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should use last day of month when dayOfMonthRentDue exceeds month days", () => {
        // Teste: se dayOfMonthRentDue = 31 e o mês tem menos dias, usar o último dia do mês
        // Exemplo: fevereiro 2023 tem 28 dias, então vencimento deve ser dia 28
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-02-01T00:00:00");
        const windowEndDate = new Date("2023-02-28T00:00:00");
        const dayOfMonthRentDue = 31; // Maior que os dias de fevereiro (28)
        const rentRateChangeFrequency = 1;
        const rentChangeRate = 0;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        // Deve usar o último dia de fevereiro (28) em vez de 31
        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-28T00:00:00") // Último dia de fevereiro, não dia 31
            }
        ];

        expect(result).toEqual(expectedResult);
    });
});
