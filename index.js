;
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory)
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory()
    } else {
        // Browser globals (root is window)
        root.GazeEvent = factory()
    }
}(this, function () {
    if (!THREE) {
        console.error('THREE is undefined,make sure you have included three.js library first.');
        return
    }
    function GazeEvent() {
        // create a raycaster
        this.raycaster = new THREE.Raycaster();
        this._center = new THREE.Vector2();
        this.rayList = {}, this.targetList = [];
        this._lastTarget = null; this.delayTime = 1500;
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
            gazeLeave: noop,
            gazeWait: noop
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
     *      'gazeLeave': When the target isn't being gazed,'gazeEnter' action will be triggered in last animation frame,
     *      'gazeWait': action will be triggered for a long gaze in last animation frame
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
    GazeEvent.prototype.removeAll = function() {
        this.rayList = {}, this.targetList = [],this._lastTarget = null;
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
                    // emit gazeLeave action on previous intersected target
                    this.rayList[this._lastTarget.id].gazeLeave(this._lastTarget);
                    // emit gazeEnter action on current intersected target
                    this._gazeEnterTime = Date.now();
                    this.rayList[currentTarget.id].gazeEnter(currentTarget);
                }
            } else { // emit gazeEnter action on current intersected target
                this._gazeEnterTime = Date.now();
                this.rayList[currentTarget.id].gazeEnter(currentTarget);
            }
            // gazeTrigger action triggered on current intersected target
            this.rayList[currentTarget.id].gazeTrigger(currentTarget);
            this._delayListener(currentTarget.id);
            this._lastTarget = currentTarget;
        } else { // nothing intersected by raycaster
            // gazeLeave action triggered on previous intersected target
            if (this._lastTarget) this.rayList[this._lastTarget.id].gazeLeave(this._lastTarget);
            this._lastTarget = null;
        }
    }
    GazeEvent.prototype._delayListener = function(targetid) {
        var _gazeEnterTime = this._gazeEnterTime,delayTime = this.delayTime,rayList = this.rayList;
        if (_gazeEnterTime && Date.now() - _gazeEnterTime > delayTime) {
            rayList[targetid].gazeWait();
            this._gazeEnterTime = null;
        }

    }
    //    exposed public method
    return GazeEvent
}));