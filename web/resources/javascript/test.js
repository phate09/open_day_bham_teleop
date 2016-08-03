/**
    * Created by phate09 on 02/08/16.
    */
var Greeter = (function () {
    function Greeter(greeting) {
        this.greeting = greeting;
    }
    Greeter.prototype.greet = function () {
        return "<h1>" + this.greeting + "</h1>";
    };
    return Greeter;
})();
var greeter = new Greeter("Hello, Alessandra!");
document.body.innerHTML = greeter.greet();
