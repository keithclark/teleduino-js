(function (root) {

    'use strict';

    var API_URL = 'https://us01.proxy.teleduino.org/api/1.0/328.php',
        DIGITAL_PIN_MIN = 0,
        DIGITAL_PIN_MAX = 19,
        ANALOG_PIN_MIN = 14,
        ANALOG_PIN_MAX = 21,
        EXPIRE_TIME_MIN = 0,
        EXPIRE_TIME_MAX = 16777215;


    /* Teleduino API
    ------------------------------------------------------------------------- */

    function Teleduino(apiKey) {
        this.apiKey = apiKey;
    }

    Teleduino.prototype = {

        /*
         * getUptime
         *
         * Returns the uptime of the device in milliseconds.
         * 
         * Arguments:
         *   callback?    Callback function               function
         */
        getUptime: function (callback) {
            apiRequest(this, 'getUptime', null, callback);
        },

        /*
         * getVersion
         *
         * Returns the firmware version of the device.
         * 
         * Arguments:
         *   callback?    Callback function               function
         */
        getVersion: function (callback) {
            apiRequest(this, 'getVersion', null, callback);
        },

        /*
         * getFreeMemory
         *
         * Returns the amount of free memory (in bytes) available on the device.
         * 
         * Arguments:
         *   callback?    Callback function               function
         */
        getFreeMemory: function (callback) {
            apiRequest(this, 'getFreeMemory', null, callback);
        },

        /*
         * ping
         *
         * Pings the device.
         * 
         * Arguments:
         *   callback?    Callback function               function
         */
        ping: function (callback) {
            apiRequest(this, 'ping', null, callback);
        },

        /*
         * reset
         *
         * Resets the device, waits 15 seconds and then periodically pings the
         * teleduino API waiting for a response from the board. Once the board
         * is up and running (or if the ping fails5 times) the callback will be
         * called.
         * 
         * Arguments:
         *   callback?    Callback function               function
         */
        reset: function (callback) {
            var self = this,
                maxPolls = 5,
                pollResetComplete = function () {
                    self.ping(function (err) {
                        if (!err) {
                            callback(null, null);
                        } else {
                            if (maxPolls > 1) {
                                maxPolls--;
                                setTimeout(pollResetComplete, 3000);
                            } else {
                                callback(new Error('Reset timeout'), null);
                            }
                        }
                    });
                };

            apiRequest(this, 'reset', null, function (err) {
                if (callback) {
                    if (err) {
                        callback(err, null);
                    } else {
                        setTimeout(pollResetComplete, 15000);
                    }
                }
            });
        },

        /*
         * setDigitalOutput
         *
         * Sets the output on a digital pin.
         * 
         * Arguments:
         *   pin          Digital pin                     number (0..19)
         *   value        Pin value                       number (0..2)
         *   expireTime   Expire time (in milliseconds)   number (0..16777215)
         *   callback?    Callback function               function
         */
        setDigitalOutput: function (pin, value, expireTime, callback) {
            if (validDigitalOutput(pin, value, expireTime)) {
                apiRequest(this, 'setDigitalOutput', {
                    pin: pin,
                    output: value,
                    expire_time: expireTime
                }, callback);
            }
        },

        /*
         * setDigitalOutputs
         *
         * Sets the outputs of one or more digital pins.
         * 
         * Arguments:
         *   pins         Array of output states          array
         *   callback?    Callback function               function
         *
         * Example:
         *   var board = new Teliduino('123abc');
         *
         *   board.setDigitalOutputs([
         *     { pin: 3, value: 1, expire: 1000 },
         *     { pin: 6, value: 0, expire: 2000 }
         *   ]);
         */
        setDigitalOutputs: function (pins, callback) {
            var params = {offset: 0},
                isValid = true;

            pins.forEach(function (output) {
                var pin = output.pin,
                    value = output.value,
                    expire = output.expire;

                if (validDigitalOutput(pin, value, expire)) {
                    params['outputs[' + pin + ']'] = value;
                    params['expire_times[' + pin + ']'] = expire;
                } else {
                    isValid = false;
                }
            });

            if (isValid) {
                apiRequest(this, 'setDigitalOutputs', params, callback);
            }
        },

        /*
         * getDigitalInput
         *
         * Gets the input on a digital pin. The callback function is passed the
         * pin state (0=low or 1=high)
         * 
         * Arguments:
         *   pin          Digital pin                     number (0..19)
         *   callback?    Callback function               function
         */
        getDigitalInput: function (pin, callback) {
            if (validDigitalPin(pin)) {
                apiRequest(this, 'getDigitalInput', {pin: pin}, callback);
            }
        },

        /*
         * getAnalogInput
         *
         * Gets the input on a analog pin. The callback function is passed the
         * pin state (0=low or 1023=high)
         * 
         * Arguments:
         *   pin          Digital pin                     number (14..21)
         *   callback?    Callback function               function
         */
        getAnalogInput: function (pin, callback) {
            if (validAnalogPin(pin)) {
                apiRequest(this, 'getAnalogInput', {pin: pin}, callback);
            }
        },

        /*
         * getAllInputs
         *
         * Returns the input values of all the digital and analog pins.
         * 
         * Arguments:
         *   callback?    Callback function               function
         */
        getAllInputs: function (callback) {
            apiRequest(this, 'getAllInputs', null, callback);
        }
    };


    /* Utilities
    ------------------------------------------------------------------------- */

    /*
     * inRange
     *
     * Checks if a number falls between two other numbers and optionally throws
     * a `RangeError` if it doesn't.
     * 
     * Arguments:
     *   value        Value to test                   number
     *   min          Minimum allowed value           number
     *   max          Maximum allowed value           number
     *   message?     Exception message               string
     */
    function inRange(value, min, max, message) {
        if (value >= min && value <= max) {
            return true;
        }
        if (message) {
            message += ' ' + value;
            message += ' (Expected value between ' + min + ' and ' + max + ')';
            throw new RangeError(message);
        }
        return false;
    }

    /*
     * validAnalogPin
     *
     * Checks if the given pin is a valid analog pin and throws
     * an exception if it isn't.
     * 
     * Arguments:
     *   ping         Pin to check                    number
     */
    function validAnalogPin(pin) {
        return inRange(pin, ANALOG_PIN_MIN, ANALOG_PIN_MAX, 'Invalid analog pin');
    }

    /*
     * validDigitalPin
     *
     * Checks if the given pin is a valid digital pin and throws
     * an exception if it isn't.
     * 
     * Arguments:
     *   ping         Pin to check                    number
     */
    function validDigitalPin(pin) {
        return inRange(pin, DIGITAL_PIN_MIN, DIGITAL_PIN_MAX, 'Invalid digital pin');
    }

    /*
     * validDigitalValue
     *
     * Checks if the given value is a valid digital pin value.
     * 
     * Arguments:
     *   value        Value to check                  number
     */
    function validDigitalValue(value) {
        return inRange(value, 0, 2, 'Invalid digital value');
    }

    /*
     * validDigitalOutput
     *
     * Checks if the given pin, value and expire are valid and
     * throws an exception if they aren't.
     * 
     * Arguments:
     *   time         Time to check                  number
     */
    function validDigitalOutput(pin, value, expireTime) {
        return validDigitalPin(pin) && validDigitalValue(value) && validExpireTime(expireTime);
    }

    /*
     * validExpireTime
     *
     * Checks if the given expiry time is a valid value.
     * 
     * Arguments:
     *   time         Time to check                  number
     */
    function validExpireTime(time) {
        return inRange(time, EXPIRE_TIME_MIN, EXPIRE_TIME_MAX, 'Invalid expiry time');
    }

    /*
     * apiRequest
     *
     * Makes the request to the Teleduino API and handles the response parsing
     * and error conditions.
     * 
     * Arguments:
     *   instance     `Teledunio` instance               object
     *   command      Teledunio API command to execute   string
     *   params       Key/Value pair of API params       object
     *   callback?    Optional callback                  function
     */
    function apiRequest(instance, command, params, callback) {
        var xhr = new XMLHttpRequest(),
            url = API_URL;

        // Ensure we have a params object
        params = params || {};

        // Add the API command and key to the param list     
        params.r = command;
        params.k = instance.apiKey;

        // Build the querystring from the params object
        Object.keys(params).forEach(function (key, i) {
            url += (i === 0) ? '?' : '&';
            url += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        });

        xhr.open('GET', url, true);

        xhr.addEventListener('readystatechange', function () {
            var json;

            // If the response isn't complete bail out now.
            if (xhr.readyState !== 4) {
                return;
            }

            // Try and parse the response as JSON
            try {
                json = JSON.parse(xhr.responseText);
            } catch (err) {
                callback(new Error('Invalid JSON response'), null);
            }

            // if we have JSON assume the API is alive
            if (json && callback) {
                if (json.response && xhr.status === 200) {
                    // The Teleduino API always responds with a `values` array.
                    if (json.response.values.length > 1) {
                        // if the `values` array contains more than one element,
                        // pass the enitre array to the callback handler.
                        callback(null, json.response.values);
                    } else if (json.response.values.length === 1) {
                        // if the `values` array contains a single element, pass
                        // that to the callback handler.
                        callback(null, json.response.values[0]);
                    } else {
                        // if the `values` array is empty then pass `null` to
                        // the callback handler.
                        callback(null, null);
                    }
                } else if (json.message) {
                    callback(new Error(json.message), null);
                } else {
                    callback(new Error('Unexpected JSON structure'), null);
                }
            }
        });
        xhr.send(null);
    }


    /* Expose Teleduino globally
    ------------------------------------------------------------------------- */

    root.Teleduino = Teleduino;

}(this));
