;
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['three'], factory)
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(require('three'))
    } else {
        // Browser globals (root is window)
        root.GazeEvent = factory(root.THREE)
    }
}(this, function (THREE) {
    if (!THREE) {
        console.error('THREE is undefined,make sure you have included three.js library first.');
        return
    }
    function GazeEvent() {
        // create a raycaster
        this.raycaster = new THREE.Raycaster();
        this._center = new THREE.Vector2();
        this.rayList = {}, this.targetList = [];
        this._lastTarget = null;
    }
    /** 
     * @param {Object} target should be an instance of THREE.Mesh
     * @param {String} actionType  
     *      'gazeEnter': When the target is being gazed,'gazeEnter' action will be triggered in first animation frame, 
     *      'gazeTrigger': When the target is being gazed,'gazeEnter' action will be triggered in every animation frame,
     *      'gazeLeave': When the target isn't being gazed,'gazeEnter' action will be triggered in last animation frame
     * @param {Function} callback 
     **/
    GazeEvent.prototype.on = function(target, actionType, callback) {
        var noop = function() { };
        if (!this.rayList[target.id]) this.rayList[target.id] = {
            target: target,
            gazeEnter: noop,
            gazeTrigger: noop,
            gazeLeave: noop
        };
        this.rayList[target.id][actionType] = callback;
        var _this = this;
        this.targetList = Object.keys(this.rayList).map(function(key) {
            return _this.rayList[key].target;
        });
    }
    /** 
     * @param {Object} target Target to be listened,it should be an instance of THREE.Mesh
     * @param {String} actionType  
     *      'gazeEnter': When the target is being gazed,'gazeEnter' action will be triggered in first animation frame, 
     *      'gazeTrigger': When the target is being gazed,'gazeEnter' action will be triggered in every animation frame,
     *      'gazeLeave': When the target isn't being gazed,'gazeEnter' action will be triggered in last animation frame
     **/
    GazeEvent.prototype.off = function(target, actionType) {
        if (!actionType) {
            delete this.rayList[target.id];
            var _this = this;
            this.targetList = Object.keys(this.rayList).map(function(key) {
                return this.rayList[key].target;
            });
        } else {
            var noop = function() { };
            this.rayList[target.id][actionType] = noop;
        }
    }
    /** Remove all the target listeners. */
    GazeEvent.prototype.clear = function() {
        this.rayList = {}, this.targetList = [];
    }
    /** observe the targets during each animation frame */
    GazeEvent.prototype.update = function(camera) {
        if (!this.targetList.length) return;
        this.raycaster.setFromCamera(this._center, camera);
        var intersects = this.raycaster.intersectObjects(this.targetList);
    
        if (intersects.length > 0) { // raycaster intersect the target
            var currentTarget = intersects[0].object;
            if (this._lastTarget) { // target intersected during previous frame.
                if (this._lastTarget.id !== currentTarget.id) { 
                    // gazeLeave action triggered on previous intersected target
                    this.rayList[this._lastTarget.id].gazeLeave(this._lastTarget);
                    // gazeEnter action triggered on current intersected target
                    this.rayList[currentTarget.id].gazeEnter(currentTarget);
                }
            } else { // gazeLeave action triggered on previous intersected target
                this.rayList[currentTarget.id].gazeEnter(currentTarget);
            }
            // gazeTrigger action triggered on current intersected target
            this.rayList[currentTarget.id].gazeTrigger(currentTarget);
            this._lastTarget = currentTarget;
        } else { // nothing intersected by raycaster
            // gazeLeave action triggered on previous intersected target
            if (this._lastTarget) this.rayList[this._lastTarget.id].gazeLeave(this._lastTarget);
            this._lastTarget = null;
        }
    }
    //    exposed public method
    return GazeEvent
}));