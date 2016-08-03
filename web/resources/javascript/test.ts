/**
    * Created by phate09 on 02/08/16.
    */
class Greeter {
    constructor(public greeting: string) { }
    greet() {
        return "<h1>" + this.greeting + "</h1>";
    }
}
var greeter = new Greeter("Hello, Alessandra!");

document.body.innerHTML = greeter.greet();