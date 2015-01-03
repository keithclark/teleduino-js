TeleduinoJS
===========

A JavaScript wrapper for the [Teleduino API](https://www.teleduino.org/documentation/api/328-full) used to communicate with ethernet enabled Arduino boards via web services. Currently, this will only work with Arduino Uno boards. Mega board support will come when I get access to a board.

**Note: this library was developed to allow prototypes to be built using a web browser. Using it "as-is" in a production environment will result in exposing your API key.**

The following API methods have been implemented – others will follow:

* ping
* reset
* getUptime
* getVersion
* getFreeMemory
* getAllInputs
* getAnalogInput
* getDigitalInput
* setDigitalOutput
* setDigitalOutputs

Callbacks
---------

API calls are async and use callbacks to handle responses. Callbacks follow the nodeJS error-first pattern which typically look like this:

```js
function (err, response) {
  if (err) {
    // handle error
  } else {
    // use response data
  }
}
```

API Reference
=============

System
------

### ping()
Pings the device.

```js
var myArduino = new Teleduino('my_api_key');

myArduino.ping(function (err) {
  if (!err) {
    console.log('pong');
  }
});
```
More information:
* [Teledunio Uno API: ping reference](https://www.teleduino.org/documentation/api/328-full#ping)
 

### getUptime()
Returns the uptime of the device in milliseconds.

```js
var myArduino = new Teleduino('my_api_key');

myArduino.getUptime(function (err, uptime) {
  if (!err) {
    console.log('Aurdino has up for ' + uptime + 'ms.');
  }
});
```

More information:
* [Teledunio Uno API: getUptime reference](https://www.teleduino.org/documentation/api/328-full#getUptime)


### getVersion()
Returns the firmware version of the device.

```js
var myArduino = new Teleduino('my_api_key');

myArduino.getVersion(function (err, version) {
  if (!err) {
    console.log('Aurdino firmware version: ' + version);
  }
});
```

More information:
* [Teledunio Uno API: getVersion reference](https://www.teleduino.org/documentation/api/328-full#getVersion)


### getFreeMemory()
Returns the amount of free memory (in bytes) available on the device.

```js
var myArduino = new Teleduino('my_api_key');

myArduino.getFreeMemory(function (err, memory) {
  if (!err) {
    console.log('Aurdino has ' + memory + ' bytes free.');
  }
});
```

More information:
* [Teledunio Uno API: getVersion reference](https://www.teleduino.org/documentation/api/328-full#getFreeMemory)

### reset()
Resets the device, waits 15 seconds and then periodically pings the Teleduino API waiting for a response from the board. Once the board is up and running the callback will be called. If if the ping fails 5 times the callback will be called with an `Error` object.

```js
var myArduino = new Teleduino('my_api_key');

myArduino.reset(function (err) {
  if (!err) {
    console.log('Aurdino has restarted.');
  }
});
```

More information:
* [Teledunio Uno API: reset reference](https://www.teleduino.org/documentation/api/328-full#reset)


## I/O

### getAllInputs(callback)
Returns the input values of all the digital and analog pins.

```js
var myArduino = new Teleduino('my_api_key');

myArduino.getAnalogInput(function (err, values) {
  if (!err) {
    console.log(values);
  }
});
```

More information:
* [Teledunio Uno API: getAllInputs reference](https://www.teleduino.org/documentation/api/328-full#getAllInputs)


### getAnalogInput(pin, callback)
Gets the input on a analog pin. The callback function is passed the pin state (0=low or 1023=high)

```js
var myArduino = new Teleduino('my_api_key');

myArduino.getAnalogInput(15, function (err, value) {
  if (!err) {
    console.log('Pin 15 is ' + value);
  }
});
```

More information:
* [Teledunio Uno API: getAnalogInput reference](https://www.teleduino.org/documentation/api/328-full#getAnalogInput)


### getDigitalInput(pin, callback)
Gets the input on a digital pin. The callback function is passed the pin state (0=low or 1=high)

```js
var myArduino = new Teleduino('my_api_key');

myArduino.getDigitalInput(3, function (err, value) {
  if (!err) {
    console.log('Pin 3 is ' + value);
  }
});
```

More information:
* [Teledunio Uno API: getDigitalInput reference](https://www.teleduino.org/documentation/api/328-full#getDigitalInput)


### setDigitalOutput(pin, value, expireTime, callback)
Sets the output on a digital pin.

```js
var myArduino = new Teleduino('my_api_key');

myArduino.setDigitalOutput(3, 1, 0, function (err) {
  if (!err) {
    console.log('Pin 3 is now high.');
  }
});
```

More information:
* [Teledunio Uno API: setDigitalOutput reference](https://www.teleduino.org/documentation/api/328-full#setDigitalOutput)


### setDigitalOutputs(outputs, callback)
 Sets the outputs of one or more digital pins.

```js
var myArduino = new Teleduino('my_api_key');

myArduino.setDigitalOutputs([
  { pin: 3, value: 1, expire: 0 },
  { pin: 6, value: 0, expire: 0 }
], function (err) {
  if (!err) {
    console.log('Pin 3 is now high and 6 is low.');
  }
});
```

More information:
* [Teledunio Uno API: setDigitalOutputs reference](https://www.teleduino.org/documentation/api/328-full#setDigitalOutputs)

