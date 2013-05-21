(function(app){

    var Events = {
        subscribers: {
            any: []
        },
        on: function(type, fn, context) {
            type = type || 'any';
            fn = typeof fn === 'function' ? fn : context[fn];

            if (typeof this.subscribers[type] === 'undefined') {
                this.subscribers[type] = [];
            }
            this.subscribers[type].push({ fn: fn, context: context || this });
        },
        off: function(type, fn, context) {
            this.eachSubscriber('unsubscribe', type, fn, context);
        },
        fire: function(type, args) {
            this.eachSubscriber('publish', type, args);
        },
        eachSubscriber: function(action, type, arg, context) {
            var eventType = type || 'any',
                subscribers = this.subscribers[eventType],
                i,
                max = subscribers ? subscribers.length : 0;

                for (i=0; i<max; i++) {
                    if (action === 'publish') {
                        subscribers[i].fn.call(subscribers[i].context, arg);
                    } else {
                        if (subscribers[i].fn === arg && subscribers[i].context === context) {
                            subscribers.splice(i, 1);
                        }
                    }
                }

        }
    };

    app.Events = Events;

}(App));
