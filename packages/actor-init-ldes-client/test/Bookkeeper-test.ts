import { url } from "inspector";
import { Bookkeeper } from "../lib/Bookkeeper";

describe('Bookkeeper', () => {
    
    test('Test Blacklist methods', () => {
        let bookkeeper: Bookkeeper = new Bookkeeper();

        expect(bookkeeper.fragmentIsBlacklisted('https://www.test.com')).toBeFalsy();
        bookkeeper.blacklistFragment('https://www.test.com');
        expect(bookkeeper.fragmentIsBlacklisted('https://www.test.com')).toBeTruthy();
    });

    test('Test queued methods', () => {
        let bookkeeper: Bookkeeper = new Bookkeeper();

        expect(bookkeeper.fragmentAlreadyAdded('https://www.test.com')).toBeFalsy();
        expect(bookkeeper.nextFragmentExists()).toBeFalsy();
        bookkeeper.addFragment('https://www.test.com', 0);
        expect(bookkeeper.fragmentAlreadyAdded('https://www.test.com')).toBeTruthy();
        expect(bookkeeper.nextFragmentExists()).toBeTruthy();
        bookkeeper.getNextFragmentToFetch();
        expect(bookkeeper.fragmentAlreadyAdded('https://www.test.com')).toBeFalsy();
        expect(bookkeeper.nextFragmentExists()).toBeFalsy();
    });

    test('Test queue methods', () => {
        let bookkeeper: Bookkeeper = new Bookkeeper();

        expect(() => bookkeeper.getNextFragmentToFetch()).toThrow();
        bookkeeper.addFragment('https://www.test.com', 0);
        let next = bookkeeper.getNextFragmentToFetch();
        expect(next.url).toBe('https://www.test.com');
        expect(next.refetchTime).toBeDefined();
        expect(() => bookkeeper.getNextFragmentToFetch()).toThrow(); 
    });

    test('Test adding blacklisted', () => {
        let bookkeeper: Bookkeeper = new Bookkeeper();

        bookkeeper.blacklistFragment('https://www.test.com');
        bookkeeper.addFragment('https://www.test.com', 0);
        expect(() => bookkeeper.getNextFragmentToFetch()).toThrow();
        expect(bookkeeper.nextFragmentExists()).toBeFalsy();
    });

    test('Test serialisation', () => {
        let bookkeeper: Bookkeeper = new Bookkeeper();

        bookkeeper.addFragment('https://www.test.com/1', 0);
        bookkeeper.addFragment('https://www.test.com/2', 10);
        bookkeeper.blacklistFragment('https://www.test.com/3');
        expect(() => bookkeeper.serialize()).toBeDefined();
        //console.log(bookkeeper.serialize());
    });

    test('Test deserialisation', () => {
        let bookkeeper: Bookkeeper = new Bookkeeper();

        bookkeeper.addFragment('https://www.test.com/1', 0);
        bookkeeper.addFragment('https://www.test.com/2', 10);
        bookkeeper.blacklistFragment('https://www.test.com/3');
        
        let serialized = bookkeeper.serialize();

        // new bookkeeper
        bookkeeper = new Bookkeeper();
        bookkeeper.deserialize(serialized);

        expect(bookkeeper.nextFragmentExists()).toBeTruthy();
        expect(bookkeeper.fragmentIsBlacklisted('https://www.test.com/3')).toBeTruthy();

        let next = bookkeeper.getNextFragmentToFetch();
        expect(next.url).toBe('https://www.test.com/1');
        expect(next.refetchTime).toBeDefined();

        expect(bookkeeper.nextFragmentExists()).toBeTruthy();
        next = bookkeeper.getNextFragmentToFetch();
        expect(next.url).toBe('https://www.test.com/2');
        expect(next.refetchTime).toBeDefined();

        expect(bookkeeper.nextFragmentExists()).toBeFalsy();
    });

    test('Test serialisation and deserialisation', () => {
        let bookkeeper: Bookkeeper = new Bookkeeper();

        bookkeeper.addFragment('https://www.test.com/1', 0);
        bookkeeper.addFragment('https://www.test.com/2', 10);
        bookkeeper.blacklistFragment('https://www.test.com/3');
        
        let serialized = bookkeeper.serialize();

        // new bookkeeper
        bookkeeper = new Bookkeeper();
        bookkeeper.deserialize(serialized);

        let serializedNew = bookkeeper.serialize();
        
        // console.log(serialized, serializedNew);
        expect(serialized).toStrictEqual(serializedNew);
    });


});