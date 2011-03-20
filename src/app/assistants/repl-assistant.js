function ReplAssistant() {
    /* this is the creator function for your scene assistant object. It will be passed all the 
       additional parameters (after the scene name) that were passed to pushScene. The reference
       to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */
}

ReplAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the scene is first created */
            
    this.outputData = [];
    
    /* setup widgets here */
    this.controller.setupWidget("outputScroller", { mode: 'vertical' }, {});

    this.outputAttrs = {
        itemTemplate: "repl/repl-itemTemplate",
        listTemplate: "repl/repl-listTemplate",
        itemsCallback: this.outputItemsCallback.bind(this),
        fixedHeightItems: false
    };
    this.outputModel = { };
    this.controller.setupWidget(
        "outputList", this.outputAttrs, this.outputModel
    ); 

    this.inputAttrs = {
        hintText: $L("Enter some JavaScript"),
        multiline: true,
        enterSubmits: false,
        focus: true,
        autoFocus: true,
        autoReplace: false,
        textCase: Mojo.Widget.steModeLowerCase
    };
    this.inputModel = {
         value: "",
         disabled: false
    };
    this.controller.setupWidget("inputWidget", this.inputAttrs, this.inputModel); 
    
    /* add event handlers to listen to events from widgets */
};

ReplAssistant.prototype.activate = function(event) {
    /* put in event handlers here that should only be in effect when this scene is active. For
       example, key handlers that are observing the document */
    this.outputWidget = this.controller.get('outputList');
    this.inputWidget = this.controller.get('inputWidget');
    this.inputWidget.observe('keyup', this.handleInputKeyEvent.bind(this));
};

ReplAssistant.prototype.handleInputKeyEvent = function(event) {
    if (event && Mojo.Char.isEnterKey(event.keyCode)) {
        var value = this.inputWidget.mojo.getValue();
        Mojo.Log.info("Got enter key, box value is " + value);
        if (value && value.length > 0) {
            var output = this.evalInput(value);
            this.outputData.push(output);
            this.outputWidget.mojo.setLengthAndInvalidate(this.outputData.length);
        }
        this.inputWidget.mojo.setValue('');
        Event.stop(event);
    }
};

ReplAssistant.prototype.evalInput = function(input) {
    var output;
    try {
        output = eval.call(null, input);
    }
    catch (err) {
        output = err;
    }

    if (output === undefined) {
        output = "undefined";
    }
    else if (typeof(output) == 'boolean') {
        output = (output ? 'true' : 'false');
    }
    else if (typeof(output) == 'string') {
        output = "'" + output + "'";
    }

    Mojo.Log.info("Evaluated value: " + output);
    return { command: input, returnValue: output };
};

ReplAssistant.prototype.outputItemsCallback = function(listWidget, offset, limit) {
    listWidget.mojo.noticeUpdatedItems(offset, this.outputData);
    listWidget.mojo.revealItem(this.outputData.length-1, true);
};

ReplAssistant.prototype.deactivate = function(event) {
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
       this scene is popped or another scene is pushed on top */
};

ReplAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
};
