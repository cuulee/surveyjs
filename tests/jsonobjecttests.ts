﻿/// <reference path="../src/jsonobject.ts" />
module Survey.JsonSerializationTests {
    class Car {
        public name: string;
        public getType(): string { return "car"; }
    }
    class FastCar extends Car {
        public getType(): string { return "fast"; }
    }
    class BigCar extends Car {
        public getType(): string { return "big"; }
    }
    class SportCar extends FastCar {
        public maxSpeed: number;
        public getType(): string { return "sport"; }
    }
    class Truck extends BigCar { 
        public maxWeight: number;
        public getType(): string { return "truck"; }
    }
     
    class Dealer {
        public name: string;
        public unserializedName: string;
        public cars = new Array<Car>();
        public stringArray: Array<string> = [];
        public defaultValue: string = "default";
        public car: Car;
        public truck: Truck;
        public trucks = new Array<Truck>();
        public changeNameOnSet: string;
        public getType(): string { return "dealer"; }
    }

    class ItemValueListOwner {
        public items: Array<ItemValue> = new Array<ItemValue>();
        public getType(): string { return "itemvaluelistowner"; }
    }

    class LongNameItemBase {
        public baseSt: string;
        public getType(): string { return "item_thelongpart"; }
    }
    class LongNameItemA extends LongNameItemBase {
        public A: number;
        public getType(): string { return "itemA_thelongpart"; }
    }
    class LongNameItemB extends LongNameItemBase {
        public B: number;
        public getType(): string { return "itemB_thelongpart"; }
    }

    class LongNamesOwner {
        public items = new Array<LongNameItemBase>();
        public getType(): string { return "LongNamesOwner"; }
    }

    JsonObject.metaData.addClass("dealer", ["name", "dummyname", "cars", "stringArray", "defaultValue", "car", "truck", "trucks", "changeNameOnSet"]);
    JsonObject.metaData.setPropertyValues("dealer", "defaultValue", null, "default");
    JsonObject.metaData.setPropertyValues("dealer", "changeNameOnSet", null, null, null, function (obj: any, value: any, jsonConv: JsonObject) {
        obj.name = value;
    });
    JsonObject.metaData.setPropertyValues("dealer", "truck", "truck");
    JsonObject.metaData.setPropertyValues("dealer", "trucks", "truck");
    JsonObject.metaData.setPropertyClassInfo("dealer", "cars", "car");

    JsonObject.metaData.addClass("fast", [], function () { return new FastCar(); }, "car");
    JsonObject.metaData.addClass("big", [], null, "car");

    JsonObject.metaData.addClass("car", ["name"]);
    JsonObject.metaData.addClass("truck", ["maxWeight"], function () { return new Truck(); }, "big");
    JsonObject.metaData.addClass("sport", ["!maxSpeed"], function () { return new SportCar(); }, "fast");

    JsonObject.metaData.addClass("itemvaluelistowner", ["items"]);
    JsonObject.metaData.setPropertyValues("itemvaluelistowner", "items", null, null,
        function (obj: any) { return ItemValue.getData(obj.items);},
        function (obj: any, value: any) { ItemValue.setData(obj.items, value); });

    
    JsonObject.metaData.addClass("item_thelongpart", ["baseSt"]);
    JsonObject.metaData.addClass("itemA_thelongpart", ["A"], function () { return new LongNameItemA(); }, "LongNameItemBase");
    JsonObject.metaData.addClass("itemB_thelongpart", ["B"], function () { return new LongNameItemB(); }, "LongNameItemBase");
    JsonObject.metaData.addClass("LongNamesOwner", ["items"]);
    JsonObject.metaData.setPropertyClassInfo("LongNamesOwner", "items", "item_thelongpart", "_thelongpart");

    QUnit.module("JsonSerializationTests");

    QUnit.test("Metadata for non inherited class", function (assert) {
        assert.equal(JsonObject.metaData.getProperties("dealer").length, 9, "Flat properties list");
        assert.equal(JsonObject.metaData.getProperties("dealer")[0].name, "name", "Name property");
    });
    QUnit.test("Metadata add at the beginning parent class properties ", function (assert) {
        assert.equal(JsonObject.metaData.getProperties("truck").length, 2, "1 + 1 parent propreties");
        assert.equal(JsonObject.metaData.getProperties("truck")[0].name, "name", "parent properties first");
    });
    QUnit.test("One object - one property serialization", function (assert) {
        var dealer = new Dealer();
        dealer.name = "small";
        dealer.unserializedName = "none";
        var jsObj = new JsonObject().toJsonObject(dealer);
        assert.equal(JSON.stringify(jsObj), "{\"name\":\"small\"}", "serialize just one property");
    });
    QUnit.test("String array serialization", function (assert) {
        var dealer = new Dealer();
        dealer.stringArray = ["one", "two"];
        var jsObj = new JsonObject().toJsonObject(dealer);
        assert.equal(JSON.stringify(jsObj), "{\"stringArray\":[\"one\",\"two\"]}", "serialize array");
    });
    QUnit.test("Use onGetValue during serialization", function (assert) {
        var dealer = new Dealer();
        var jsObj = new JsonObject().toJsonObject(dealer);
        assert.equal(JSON.stringify(jsObj), "{}", "default value of this property is not serialized");
        dealer.defaultValue = "nondefault";
        var jsObj = new JsonObject().toJsonObject(dealer);
        assert.equal(JSON.stringify(jsObj), "{\"defaultValue\":\"nondefault\"}", "serialize non default property as any other");
    });
    QUnit.test("Serialize object with it's type", function (assert) {
        var dealer = new Dealer();
        var truck = new Truck();
        truck.maxWeight = 10000;
        dealer.car = truck;
        var jsObj = new JsonObject().toJsonObject(dealer);
        assert.equal(JSON.stringify(jsObj), "{\"car\":{\"type\":\"truck\",\"maxWeight\":10000}}", "serialize object with it's type");
    });
    QUnit.test("Serialize arrays with serializable objects", function (assert) {
        var dealer = new Dealer();
        var truck = new Truck();
        truck.maxWeight = 10000;
        var sport = new SportCar();
        sport.maxSpeed = 320;
        dealer.cars = [sport, truck];
        var jsObj = new JsonObject().toJsonObject(dealer);
        assert.equal(JSON.stringify(jsObj), "{\"cars\":[{\"type\":\"sport\",\"maxSpeed\":320},{\"type\":\"truck\",\"maxWeight\":10000}]}", "serialize objects with their type");
    });
    QUnit.test("Serialize object and get type by it's property", function (assert) {
        var dealer = new Dealer();
        var truck = new Truck();
        dealer.truck = new Truck();
        dealer.truck.maxWeight = 10000;
        var jsObj = new JsonObject().toJsonObject(dealer);
        assert.equal(JSON.stringify(jsObj), "{\"truck\":{\"maxWeight\":10000}}", "serialize object without it's type");
    });
    QUnit.test("Serialize arrays with serializable objects and get type by it's property", function (assert) {
        var dealer = new Dealer();
        dealer.trucks.push(new Truck());
        dealer.trucks.push(new Truck());
        dealer.trucks[0].maxWeight = 10000;
        dealer.trucks[1].maxWeight = 15000;
        var jsObj = new JsonObject().toJsonObject(dealer);
        assert.equal(JSON.stringify(jsObj), "{\"trucks\":[{\"maxWeight\":10000},{\"maxWeight\":15000}]}", "serialize objects without their type");
    });

    QUnit.test("One object - one property deserialization", function (assert) {
        var dealer = new Dealer();
        new JsonObject().toObject({ "name": "small" }, dealer);
        assert.equal(dealer.name, "small", "deserialize just one property");
    });
    QUnit.test("String array deserialization", function (assert) {
        var dealer = new Dealer();
        new JsonObject().toObject({ "stringArray": ["one", "two"] }, dealer);
        assert.deepEqual(dealer.stringArray, ["one", "two"], "deserialize array");
    });
    QUnit.test("Deserialize object with it's type", function (assert) {
        var dealer = new Dealer();
        new JsonObject().toObject({ "car": { "type": "truck", "maxWeight": 10000 } }, dealer);
        var truck: any = dealer.car;
        assert.equal(truck.maxWeight, 10000, "deserialize object with it's type");
        assert.equal(truck.getType(), "truck", "the live object");
        assert.notEqual(truck.type, "truck", "type is removed");
    });
    QUnit.test("Deserialize arrays with serializable objects", function (assert) {
        var dealer = new Dealer();
        new JsonObject().toObject({ "cars": [{ "type": "sport", "maxSpeed": 320 }, { "type": "truck", "maxWeight": 10000 }] }, dealer);
        assert.equal(dealer.cars.length, 2, "two objects in array should be deserialized");
        var sport: any = dealer.cars[0];
        var truck: any = dealer.cars[1];
        assert.equal(sport.maxSpeed, 320, "deserialize the first object");
        assert.equal(sport.getType(), "sport", "deserialize the first object");
        assert.equal(truck.maxWeight, 10000, "deserialize the second object");
        assert.equal(truck.getType(), "truck", "deserialize the second object");
    });
    QUnit.test("Deserialize object and get type by it's property className", function (assert) {
        var dealer = new Dealer();
        new JsonObject().toObject({ "truck": { "maxWeight": 10000 } }, dealer);
        assert.equal(dealer.truck.maxWeight, 10000, "deserialize object with it's type");
        assert.equal(dealer.truck.getType(), "truck", "the live object");
    });
    QUnit.test("Deserialize arrays with serializable objects and get type by it's property className", function (assert) {
        var dealer = new Dealer();
        new JsonObject().toObject({ "trucks": [{ "maxWeight": 10000 }, { "maxWeight": 15000 }] }, dealer);
        assert.equal(dealer.trucks.length, 2, "two objects in array should be deserialized");
        assert.equal(dealer.trucks[0].maxWeight, 10000, "deserialize the first object");
        assert.equal(dealer.trucks[0].getType(), "truck", "deserialize the first object");
        assert.equal(dealer.trucks[1].maxWeight, 15000, "deserialize the second object");
        assert.equal(dealer.trucks[1].getType(), "truck", "deserialize the second object");
    });
    QUnit.test("Use on setValue during deserialization", function (assert) {
        var dealer = new Dealer();
        new JsonObject().toObject({ "changeNameOnSet": "nameIsChanged" }, dealer);
        assert.equal(dealer.name, "nameIsChanged", "the property name is set");
    });
    QUnit.test("ItemValueListOwner serialization", function (assert) {
        var list = new ItemValueListOwner();
        list.items.push(new ItemValue(7, "Item 1"));
        list.items.push(new ItemValue(5));
        list.items.push(new ItemValue("item"));

        var jsObj = new JsonObject().toJsonObject(list);
        assert.equal(JSON.stringify(jsObj), "{\"items\":[{\"value\":7,\"text\":\"Item 1\"},5,\"item\"]}", "serialize ItemValueListOwner");
    });
    QUnit.test("ItemValueListOwner deserialization", function (assert) {
        var list = new ItemValueListOwner();
        new JsonObject().toObject({ "items": [{ "value": 7, "text": "Item 1" }, 5, "item", "value1|text1"] }, list);
        assert.equal(list.items.length, 4, "there are 4 items");
        assert.equal(list.items[1].value, 5, "set correct value property for the second item");
        assert.equal(list.items[1].text, "5", "set correct text property for the second item");
        assert.equal(list.items[3].value, "value1", "set correct value property for the fourth item");
        assert.equal(list.items[3].text, "text1", "set correct text property for the fourth item");
    });
    QUnit.test("LongNamesOwner serialization", function (assert) {
        var owner = new LongNamesOwner();
        var l1 = new LongNameItemA();  l1.A = 5;
        var l2 = new LongNameItemB(); l2.B = 15;
        owner.items.push(l1);
        owner.items.push(l2);
        var jsObj = new JsonObject().toJsonObject(owner);
        assert.equal(JSON.stringify(jsObj), "{\"items\":[{\"type\":\"itemA\",\"A\":5},{\"type\":\"itemB\",\"B\":15}]}", "serialize LongNamesOwner");
    });
    QUnit.test("ItemValueListOwner deserialization", function (assert) {
        var owner = new LongNamesOwner();
        new JsonObject().toObject({ items: [{ type: "itemA", A: 5 }, { type: "itemB_thelongpart", B: 15 }] }, owner);
        assert.equal(owner.items.length, 2, "there are 2 items");
        assert.equal(owner.items[0].getType(), "itemA_thelongpart", "the first object is live");
        assert.equal(owner.items[1].getType(), "itemB_thelongpart", "the second object is live");
    });
    QUnit.test("Do not change Json", function (assert) {
        var json = { items: [{ type: "itemA", A: 5 }, { type: "itemB_thelongpart", B: 15 }] };
        var jsonText = JSON.stringify(json);
        var owner = new LongNamesOwner();
        new JsonObject().toObject(json, owner);
        assert.equal(JSON.stringify(json), jsonText, "Json object should be the same after deserialization");
    });

    QUnit.test("Unknown property error on deserialization", function (assert) {
        var owner = new LongNamesOwner();
        var jsonObj = new JsonObject();
        jsonObj.toObject({ unknown1: 4, items: [{ type: "itemA", A: 5 }, { unknown2: 5, type: "itemB_thelongpart", B: 15 }] }, owner);
        assert.equal(jsonObj.errors.length, 2, "it should be two errors");
        assert.equal((<JsonUnknownPropertyError>jsonObj.errors[0]).propertyName, "unknown1", "the property Name in the first error");
        assert.equal((<JsonUnknownPropertyError>jsonObj.errors[0]).className, "LongNamesOwner", "the class Name in the first error");
        assert.equal((<JsonUnknownPropertyError>jsonObj.errors[1]).propertyName, "unknown2", "the property Name in the second error");
        assert.equal((<JsonUnknownPropertyError>jsonObj.errors[1]).className, "itemB_thelongpart", "the class Name in the second error");
    });
    QUnit.test("Having 'at' property for objects with errors", function (assert) {
        var owner = new LongNamesOwner();
        var jsonObj = new JsonObject();
        jsonObj.toObject({ at: 1, unknown1: 4, items: [{ at: 20, type: "itemA", A: 5 }, { at: 30, unknown2: 5, type: "itemB_thelongpart", B: 15 }] }, owner);
        assert.equal(jsonObj.errors.length, 2, "it should be two errors");
        assert.equal((<JsonUnknownPropertyError>jsonObj.errors[0]).at, 1);
        assert.equal((<JsonUnknownPropertyError>jsonObj.errors[1]).at, 30);
    });
    QUnit.test("Do not remove 'at' property from objects", function (assert) {
        var dealer = new Dealer();
        var jsonObj = new JsonObject();
        jsonObj.toObject({ at: 1, "cars": [{ at: 10, "maxSpeed": 320 }, { at: 20,"type": "truck", "maxWeight": 10000 }] }, dealer);
        var truck = <Truck>dealer.cars[0];
        assert.equal(truck["at"], 20, "deserialize the second object");
    });
    QUnit.test("Deserialize arrays with missing type property", function (assert) {
        var dealer = new Dealer();
        var jsonObj = new JsonObject();
        jsonObj.toObject({ "cars": [{ "maxSpeed": 320 }, { "type": "truck", "maxWeight": 10000 }] }, dealer);
        assert.equal(dealer.cars.length, 1, "can only one object deserialized");
        var truck = <Truck>dealer.cars[0];
        assert.equal(truck.maxWeight, 10000, "deserialize the second object");
        assert.equal(truck.getType(), "truck", "deserialize the second object");
        assert.equal(jsonObj.errors.length, 1, "there should be one error");
        assert.equal(jsonObj.errors[0].type, "missingtypeproperty", "The missing type property error");
    });
    QUnit.test("Deserialize arrays with incorrect type property", function (assert) {
        var dealer = new Dealer();
        var jsonObj = new JsonObject();
        jsonObj.toObject({ "cars": [{ "type": "unknown",  "maxSpeed": 320 }, { "type": "truck", "maxWeight": 10000 }] }, dealer);
        assert.equal(dealer.cars.length, 1, "can only one object deserialized");
        var truck = <Truck>dealer.cars[0];
        assert.equal(truck.maxWeight, 10000, "deserialize the second object");
        assert.equal(truck.getType(), "truck", "deserialize the second object");
        assert.equal(jsonObj.errors.length, 1, "there should be one error");
        assert.equal(jsonObj.errors[0].type, "incorrecttypeproperty", "The incorrect type property error");
    });
    QUnit.test("Deserialization - required property error", function (assert) {
        var dealer = new Dealer();
        var jsonObj = new JsonObject();
        jsonObj.toObject({ "cars": [{ "type": "sport"}] }, dealer);
        assert.equal(dealer.cars.length, 1, "One object is deserialized");
        assert.equal(jsonObj.errors.length, 1, "there should be one error about required property");
        assert.equal(jsonObj.errors[0].type, "requiredproperty", "The required property error");
    });
     QUnit.test("Deserialization - required property error", function (assert) {
        var children = JsonObject.metaData.getChildrenClasses("car");
        assert.equal(children.length, 4, "There are 4 children classes");
        children = JsonObject.metaData.getChildrenClasses("car", true);
        assert.equal(children.length, 3, "There are 3 children classes that can be created.");
    });
}