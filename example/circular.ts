export class CircularA {
    constructor(
        private readonly b: CircularB
    ) {
        console.log(`Init A`);
    }

    getValue() {
        return 42 * this.b.getMultiplier();
    }
}

export class CircularB {
    constructor(
        private readonly a: CircularA
    ) {
        console.log(`Init B`);
    }

    getMultiplier() {
        return 1;
    }

    sayValue() {
        return `Answer = ${this.a.getValue()}`;
    }
}