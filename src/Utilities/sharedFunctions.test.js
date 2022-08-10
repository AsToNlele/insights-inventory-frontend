/* eslint-disable no-constant-condition */
import { subtractWeeks, verifyStaleInsightsClient } from './sharedFunctions';

describe('sharedFunctions', () => {
    describe('verfiyDisconnectedSystem', () => {
        it('should return false when puptoo is undefined', () => {
            const result = verifyStaleInsightsClient({});
            expect(result).toBeTruthy();
        });

        it('should return false when puptoo is defined and stale_timestamp is not more recent than 2 weeks ago', () => {
            const result = verifyStaleInsightsClient({ puptoo: new Date('2022-07-07T18:22:04.663407+00:00') });
            expect(result).toBeFalsy();
        });
    });
    describe('substractWeeks', () => {
        it('Should return 1 week earlier date than current date', () => {
            const result = subtractWeeks(1);
            let today = new Date();
            const expectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            expect(result.getDate()).toEqual(expectedDate.getDate());
        });

        it('Should return 1 week earlier date than provided date', () => {
            const testDate = new Date('2022-07-20T10:07:08.313Z');
            const result = subtractWeeks(1, testDate);
            expect(result.getDate()).toEqual(13);
        });
    });
});

