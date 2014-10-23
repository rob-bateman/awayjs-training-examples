/*

SkyBox example in Away3d

Demonstrates:

How to use a CubeTexture to create a SkyBox object.
How to apply a CubeTexture to a material as an environment map.

Code by Rob Bateman
rob@infiniteturtles.co.uk
http://www.infiniteturtles.co.uk

This code is distributed under the MIT License

Copyright (c) The Away Foundation http://www.theawayfoundation.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetLoaderContext = require("awayjs-core/lib/library/AssetLoaderContext");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var PerspectiveProjection = require("awayjs-core/lib/projections/PerspectiveProjection");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/containers/View");
var Skybox = require("awayjs-display/lib/entities/Skybox");
var PrimitiveTorusPrefab = require("awayjs-display/lib/prefabs/PrimitiveTorusPrefab");
var SkyboxMaterial = require("awayjs-stagegl/lib/materials/SkyboxMaterial");
var TriangleMethodMaterial = require("awayjs-stagegl/lib/materials/TriangleMethodMaterial");
var DefaultRenderer = require("awayjs-stagegl/lib/render/DefaultRenderer");
var EffectEnvMapMethod = require("awayjs-renderergl/lib/materials/methods/EffectEnvMapMethod");
var Basic_SkyBox = (function () {
    /**
     * Constructor
     */
    function Basic_SkyBox() {
        this._time = 0;
        this.init();
    }
    /**
     * Global initialise function
     */
    Basic_SkyBox.prototype.init = function () {
        this.initEngine();
        this.initMaterials();
        this.initObjects();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    Basic_SkyBox.prototype.initEngine = function () {
        //setup the view
        this._view = new View(new DefaultRenderer());
        //setup the camera
        this._view.camera.z = -600;
        this._view.camera.y = 0;
        this._view.camera.lookAt(new Vector3D());
        this._view.camera.projection = new PerspectiveProjection(90);
        this._view.backgroundColor = 0xFFFF00;
        this._mouseX = window.innerWidth / 2;
    };
    /**
     * Initialise the materials
     */
    Basic_SkyBox.prototype.initMaterials = function () {
        //setup the torus material
        this._torusMaterial = new TriangleMethodMaterial(0xFFFFFF, 1);
        this._torusMaterial.specular = 0.5;
        this._torusMaterial.ambient = 0.25;
        this._torusMaterial.color = 0x111199;
        this._torusMaterial.ambient = 1;
    };
    /**
     * Initialise the scene objects
     */
    Basic_SkyBox.prototype.initObjects = function () {
        this._torus = new PrimitiveTorusPrefab(150, 60, 40, 20).getNewObject();
        this._torus.material = this._torusMaterial;
        this._view.scene.addChild(this._torus);
    };
    /**
     * Initialise the listeners
     */
    Basic_SkyBox.prototype.initListeners = function () {
        var _this = this;
        document.onmousemove = function (event) { return _this.onMouseMove(event); };
        window.onresize = function (event) { return _this.onResize(event); };
        this.onResize();
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
        AssetLibrary.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        //setup the url map for textures in the cubemap file
        var assetLoaderContext = new AssetLoaderContext();
        assetLoaderContext.dependencyBaseUrl = "assets/skybox/";
        //environment texture
        AssetLibrary.load(new URLRequest("assets/skybox/snow_texture.cube"), assetLoaderContext);
    };
    /**
     * Navigation and render loop
     */
    Basic_SkyBox.prototype.onEnterFrame = function (dt) {
        this._torus.rotationX += 2;
        this._torus.rotationY += 1;
        this._view.camera.transform.position = new Vector3D();
        this._view.camera.rotationY += 0.5 * (this._mouseX - window.innerWidth / 2) / 800;
        this._view.camera.transform.moveBackward(600);
        this._view.render();
    };
    /**
     * Listener function for resource complete event on asset library
     */
    Basic_SkyBox.prototype.onResourceComplete = function (event) {
        switch (event.url) {
            case 'assets/skybox/snow_texture.cube':
                this._cubeTexture = event.assets[0];
                this._skyBox = new Skybox(new SkyboxMaterial(this._cubeTexture));
                this._view.scene.addChild(this._skyBox);
                this._torusMaterial.addEffectMethod(new EffectEnvMapMethod(this._cubeTexture, 1));
                break;
        }
    };
    /**
     * Mouse move listener for navigation
     */
    Basic_SkyBox.prototype.onMouseMove = function (event) {
        this._mouseX = event.clientX;
        this._mouseY = event.clientY;
    };
    /**
     * window listener for resize events
     */
    Basic_SkyBox.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return Basic_SkyBox;
})();
window.onload = function () {
    new Basic_SkyBox();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9CYXNpY19Ta3lCb3gudHMiXSwibmFtZXMiOlsiQmFzaWNfU2t5Qm94IiwiQmFzaWNfU2t5Qm94LmNvbnN0cnVjdG9yIiwiQmFzaWNfU2t5Qm94LmluaXQiLCJCYXNpY19Ta3lCb3guaW5pdEVuZ2luZSIsIkJhc2ljX1NreUJveC5pbml0TWF0ZXJpYWxzIiwiQmFzaWNfU2t5Qm94LmluaXRPYmplY3RzIiwiQmFzaWNfU2t5Qm94LmluaXRMaXN0ZW5lcnMiLCJCYXNpY19Ta3lCb3gub25FbnRlckZyYW1lIiwiQmFzaWNfU2t5Qm94Lm9uUmVzb3VyY2VDb21wbGV0ZSIsIkJhc2ljX1NreUJveC5vbk1vdXNlTW92ZSIsIkJhc2ljX1NreUJveC5vblJlc2l6ZSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBbUNFO0FBRUYsSUFBTyxXQUFXLFdBQWUsb0NBQW9DLENBQUMsQ0FBQztBQUN2RSxJQUFPLFFBQVEsV0FBZ0IsK0JBQStCLENBQUMsQ0FBQztBQUNoRSxJQUFPLFlBQVksV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBQzFFLElBQU8sa0JBQWtCLFdBQWEsNENBQTRDLENBQUMsQ0FBQztBQUNwRixJQUFPLFVBQVUsV0FBZSxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ2xFLElBQU8scUJBQXFCLFdBQVksbURBQW1ELENBQUMsQ0FBQztBQUU3RixJQUFPLHFCQUFxQixXQUFZLDZDQUE2QyxDQUFDLENBQUM7QUFFdkYsSUFBTyxJQUFJLFdBQWlCLG9DQUFvQyxDQUFDLENBQUM7QUFFbEUsSUFBTyxNQUFNLFdBQWdCLG9DQUFvQyxDQUFDLENBQUM7QUFDbkUsSUFBTyxvQkFBb0IsV0FBYSxpREFBaUQsQ0FBQyxDQUFDO0FBRTNGLElBQU8sY0FBYyxXQUFjLDZDQUE2QyxDQUFDLENBQUM7QUFDbEYsSUFBTyxzQkFBc0IsV0FBWSxxREFBcUQsQ0FBQyxDQUFDO0FBQ2hHLElBQU8sZUFBZSxXQUFjLDJDQUEyQyxDQUFDLENBQUM7QUFFakYsSUFBTyxrQkFBa0IsV0FBYSw0REFBNEQsQ0FBQyxDQUFDO0FBRXBHLElBQU0sWUFBWTtJQW1CakJBOztPQUVHQTtJQUNIQSxTQXRCS0EsWUFBWUE7UUFlVEMsVUFBS0EsR0FBVUEsQ0FBQ0EsQ0FBQ0E7UUFTeEJBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO0lBQ2JBLENBQUNBO0lBRUREOztPQUVHQTtJQUNLQSwyQkFBSUEsR0FBWkE7UUFFQ0UsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7UUFDbEJBLElBQUlBLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBO1FBQ3JCQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUNuQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0E7SUFDdEJBLENBQUNBO0lBRURGOztPQUVHQTtJQUNLQSxpQ0FBVUEsR0FBbEJBO1FBRUNHLEFBQ0FBLGdCQURnQkE7UUFDaEJBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLGVBQWVBLEVBQUVBLENBQUNBLENBQUNBO1FBRTdDQSxBQUNBQSxrQkFEa0JBO1FBQ2xCQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQTtRQUMzQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDeEJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLFFBQVFBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3pDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxVQUFVQSxHQUFHQSxJQUFJQSxxQkFBcUJBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1FBQzdEQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxlQUFlQSxHQUFHQSxRQUFRQSxDQUFDQTtRQUN0Q0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsR0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDcENBLENBQUNBO0lBRURIOztPQUVHQTtJQUNLQSxvQ0FBYUEsR0FBckJBO1FBRUNJLEFBQ0FBLDBCQUQwQkE7UUFDMUJBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLHNCQUFzQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDOURBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFFBQVFBLEdBQUdBLEdBQUdBLENBQUNBO1FBQ25DQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNuQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsS0FBS0EsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDckNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLE9BQU9BLEdBQUdBLENBQUNBLENBQUNBO0lBQ2pDQSxDQUFDQTtJQUVESjs7T0FFR0E7SUFDS0Esa0NBQVdBLEdBQW5CQTtRQUVDSyxJQUFJQSxDQUFDQSxNQUFNQSxHQUFVQSxJQUFJQSxvQkFBb0JBLENBQUNBLEdBQUdBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBO1FBQzlFQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUMzQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDeENBLENBQUNBO0lBRURMOztPQUVHQTtJQUNLQSxvQ0FBYUEsR0FBckJBO1FBQUFNLGlCQW1CQ0E7UUFqQkFBLFFBQVFBLENBQUNBLFdBQVdBLEdBQUdBLFVBQUNBLEtBQWdCQSxJQUFLQSxPQUFBQSxLQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUF2QkEsQ0FBdUJBLENBQUNBO1FBRXJFQSxNQUFNQSxDQUFDQSxRQUFRQSxHQUFJQSxVQUFDQSxLQUFhQSxJQUFLQSxPQUFBQSxLQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUFwQkEsQ0FBb0JBLENBQUNBO1FBRTNEQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQTtRQUVoQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEscUJBQXFCQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNqRUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7UUFFcEJBLFlBQVlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxVQUFDQSxLQUFpQkEsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUE5QkEsQ0FBOEJBLENBQUNBLENBQUNBO1FBRXBIQSxBQUNBQSxvREFEb0RBO1lBQ2hEQSxrQkFBa0JBLEdBQXNCQSxJQUFJQSxrQkFBa0JBLEVBQUVBLENBQUNBO1FBQ3JFQSxrQkFBa0JBLENBQUNBLGlCQUFpQkEsR0FBR0EsZ0JBQWdCQSxDQUFDQTtRQUV4REEsQUFDQUEscUJBRHFCQTtRQUNyQkEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsaUNBQWlDQSxDQUFDQSxFQUFFQSxrQkFBa0JBLENBQUNBLENBQUNBO0lBQzFGQSxDQUFDQTtJQUdETjs7T0FFR0E7SUFDS0EsbUNBQVlBLEdBQXBCQSxVQUFxQkEsRUFBU0E7UUFFN0JPLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLElBQUlBLENBQUNBLENBQUNBO1FBQzNCQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUUzQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsUUFBUUEsRUFBRUEsQ0FBQ0E7UUFDdERBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLElBQUlBLEdBQUdBLEdBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLENBQUNBLFVBQVVBLEdBQUNBLENBQUNBLENBQUNBLEdBQUNBLEdBQUdBLENBQUNBO1FBQzVFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUM5Q0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7SUFDckJBLENBQUNBO0lBRURQOztPQUVHQTtJQUNLQSx5Q0FBa0JBLEdBQTFCQSxVQUEyQkEsS0FBaUJBO1FBRTNDUSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUNsQkEsQ0FBQ0E7WUFDQUEsS0FBS0EsaUNBQWlDQTtnQkFDckNBLElBQUlBLENBQUNBLFlBQVlBLEdBQXNCQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFFdkRBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLE1BQU1BLENBQUNBLElBQUlBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBO2dCQUNqRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7Z0JBRXhDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUVsRkEsS0FBS0EsQ0FBQ0E7UUFDUkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFRFI7O09BRUdBO0lBQ0tBLGtDQUFXQSxHQUFuQkEsVUFBb0JBLEtBQWdCQTtRQUVuQ1MsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFDN0JBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBO0lBQzlCQSxDQUFDQTtJQUVEVDs7T0FFR0E7SUFDS0EsK0JBQVFBLEdBQWhCQSxVQUFpQkEsS0FBb0JBO1FBQXBCVSxxQkFBb0JBLEdBQXBCQSxZQUFvQkE7UUFFcENBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7UUFDckNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO0lBQ3hDQSxDQUFDQTtJQUNGVixtQkFBQ0E7QUFBREEsQ0EzSkEsQUEySkNBLElBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxHQUFHO0lBRWYsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUNwQixDQUFDLENBQUEiLCJmaWxlIjoiQmFzaWNfU2t5Qm94LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuU2t5Qm94IGV4YW1wbGUgaW4gQXdheTNkXG5cbkRlbW9uc3RyYXRlczpcblxuSG93IHRvIHVzZSBhIEN1YmVUZXh0dXJlIHRvIGNyZWF0ZSBhIFNreUJveCBvYmplY3QuXG5Ib3cgdG8gYXBwbHkgYSBDdWJlVGV4dHVyZSB0byBhIG1hdGVyaWFsIGFzIGFuIGVudmlyb25tZW50IG1hcC5cblxuQ29kZSBieSBSb2IgQmF0ZW1hblxucm9iQGluZmluaXRldHVydGxlcy5jby51a1xuaHR0cDovL3d3dy5pbmZpbml0ZXR1cnRsZXMuY28udWtcblxuVGhpcyBjb2RlIGlzIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuXG5Db3B5cmlnaHQgKGMpIFRoZSBBd2F5IEZvdW5kYXRpb24gaHR0cDovL3d3dy50aGVhd2F5Zm91bmRhdGlvbi5vcmdcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUg4oCcU29mdHdhcmXigJ0pLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIOKAnEFTIElT4oCdLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cblRIRSBTT0ZUV0FSRS5cblxuKi9cblxuaW1wb3J0IExvYWRlckV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvTG9hZGVyRXZlbnRcIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMaWJyYXJ5XCIpO1xuaW1wb3J0IEFzc2V0TG9hZGVyQ29udGV4dFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TG9hZGVyQ29udGV4dFwiKTtcbmltcG9ydCBVUkxSZXF1ZXN0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMUmVxdWVzdFwiKTtcbmltcG9ydCBQZXJzcGVjdGl2ZVByb2plY3Rpb25cdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3Byb2plY3Rpb25zL1BlcnNwZWN0aXZlUHJvamVjdGlvblwiKTtcbmltcG9ydCBJbWFnZUN1YmVUZXh0dXJlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VDdWJlVGV4dHVyZVwiKTtcbmltcG9ydCBSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL1JlcXVlc3RBbmltYXRpb25GcmFtZVwiKTtcblxuaW1wb3J0IFZpZXdcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL1ZpZXdcIik7XG5pbXBvcnQgTWVzaFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL01lc2hcIik7XG5pbXBvcnQgU2t5Ym94XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1NreWJveFwiKTtcbmltcG9ydCBQcmltaXRpdmVUb3J1c1ByZWZhYlx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9wcmVmYWJzL1ByaW1pdGl2ZVRvcnVzUHJlZmFiXCIpO1xuXG5pbXBvcnQgU2t5Ym94TWF0ZXJpYWxcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvU2t5Ym94TWF0ZXJpYWxcIik7XG5pbXBvcnQgVHJpYW5nbGVNZXRob2RNYXRlcmlhbFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL1RyaWFuZ2xlTWV0aG9kTWF0ZXJpYWxcIik7XG5pbXBvcnQgRGVmYXVsdFJlbmRlcmVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvcmVuZGVyL0RlZmF1bHRSZW5kZXJlclwiKTtcblxuaW1wb3J0IEVmZmVjdEVudk1hcE1ldGhvZFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9FZmZlY3RFbnZNYXBNZXRob2RcIik7XG5cbmNsYXNzIEJhc2ljX1NreUJveFxue1xuXHQvL2VuZ2luZSB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfdmlldzpWaWV3O1xuXG5cdC8vbWF0ZXJpYWwgb2JqZWN0c1xuXHRwcml2YXRlIF9jdWJlVGV4dHVyZTpJbWFnZUN1YmVUZXh0dXJlO1xuXHRwcml2YXRlIF90b3J1c01hdGVyaWFsOlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWw7XG5cblx0Ly9zY2VuZSBvYmplY3RzXG5cdHByaXZhdGUgX3NreUJveDpTa3lib3g7XG5cdHByaXZhdGUgX3RvcnVzOk1lc2g7XG5cblx0Ly9uYXZpZ2F0aW9uIHZhcmlhYmxlc1xuXHRwcml2YXRlIF90aW1lcjpSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cdHByaXZhdGUgX3RpbWU6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfbW91c2VYOm51bWJlcjtcblx0cHJpdmF0ZSBfbW91c2VZOm51bWJlcjtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdsb2JhbCBpbml0aWFsaXNlIGZ1bmN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGluaXQoKTp2b2lkXG5cdHtcblx0XHR0aGlzLmluaXRFbmdpbmUoKTtcblx0XHR0aGlzLmluaXRNYXRlcmlhbHMoKTtcblx0XHR0aGlzLmluaXRPYmplY3RzKCk7XG5cdFx0dGhpcy5pbml0TGlzdGVuZXJzKCk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgZW5naW5lXG5cdCAqL1xuXHRwcml2YXRlIGluaXRFbmdpbmUoKTp2b2lkXG5cdHtcblx0XHQvL3NldHVwIHRoZSB2aWV3XG5cdFx0dGhpcy5fdmlldyA9IG5ldyBWaWV3KG5ldyBEZWZhdWx0UmVuZGVyZXIoKSk7XG5cblx0XHQvL3NldHVwIHRoZSBjYW1lcmFcblx0XHR0aGlzLl92aWV3LmNhbWVyYS56ID0gLTYwMDtcblx0XHR0aGlzLl92aWV3LmNhbWVyYS55ID0gMDtcblx0XHR0aGlzLl92aWV3LmNhbWVyYS5sb29rQXQobmV3IFZlY3RvcjNEKCkpO1xuXHRcdHRoaXMuX3ZpZXcuY2FtZXJhLnByb2plY3Rpb24gPSBuZXcgUGVyc3BlY3RpdmVQcm9qZWN0aW9uKDkwKTtcblx0XHR0aGlzLl92aWV3LmJhY2tncm91bmRDb2xvciA9IDB4RkZGRjAwO1xuXHRcdHRoaXMuX21vdXNlWCA9IHdpbmRvdy5pbm5lcldpZHRoLzI7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbWF0ZXJpYWxzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRNYXRlcmlhbHMoKTp2b2lkXG5cdHtcblx0XHQvL3NldHVwIHRoZSB0b3J1cyBtYXRlcmlhbFxuXHRcdHRoaXMuX3RvcnVzTWF0ZXJpYWwgPSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbCgweEZGRkZGRiwgMSk7XG5cdFx0dGhpcy5fdG9ydXNNYXRlcmlhbC5zcGVjdWxhciA9IDAuNTtcblx0XHR0aGlzLl90b3J1c01hdGVyaWFsLmFtYmllbnQgPSAwLjI1O1xuXHRcdHRoaXMuX3RvcnVzTWF0ZXJpYWwuY29sb3IgPSAweDExMTE5OTtcblx0XHR0aGlzLl90b3J1c01hdGVyaWFsLmFtYmllbnQgPSAxO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIHNjZW5lIG9iamVjdHNcblx0ICovXG5cdHByaXZhdGUgaW5pdE9iamVjdHMoKTp2b2lkXG5cdHtcblx0XHR0aGlzLl90b3J1cyA9IDxNZXNoPiBuZXcgUHJpbWl0aXZlVG9ydXNQcmVmYWIoMTUwLCA2MCwgNDAsIDIwKS5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLl90b3J1cy5tYXRlcmlhbCA9IHRoaXMuX3RvcnVzTWF0ZXJpYWw7XG5cdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZCh0aGlzLl90b3J1cyk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlzdGVuZXJzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaXN0ZW5lcnMoKTp2b2lkXG5cdHtcblx0XHRkb2N1bWVudC5vbm1vdXNlbW92ZSA9IChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VNb3ZlKGV2ZW50KTtcblxuXHRcdHdpbmRvdy5vbnJlc2l6ZSAgPSAoZXZlbnQ6VUlFdmVudCkgPT4gdGhpcy5vblJlc2l6ZShldmVudCk7XG5cblx0XHR0aGlzLm9uUmVzaXplKCk7XG5cblx0XHR0aGlzLl90aW1lciA9IG5ldyBSZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkVudGVyRnJhbWUsIHRoaXMpO1xuXHRcdHRoaXMuX3RpbWVyLnN0YXJ0KCk7XG5cblx0XHRBc3NldExpYnJhcnkuYWRkRXZlbnRMaXN0ZW5lcihMb2FkZXJFdmVudC5SRVNPVVJDRV9DT01QTEVURSwgKGV2ZW50OkxvYWRlckV2ZW50KSA9PiB0aGlzLm9uUmVzb3VyY2VDb21wbGV0ZShldmVudCkpO1xuXG5cdFx0Ly9zZXR1cCB0aGUgdXJsIG1hcCBmb3IgdGV4dHVyZXMgaW4gdGhlIGN1YmVtYXAgZmlsZVxuXHRcdHZhciBhc3NldExvYWRlckNvbnRleHQ6QXNzZXRMb2FkZXJDb250ZXh0ID0gbmV3IEFzc2V0TG9hZGVyQ29udGV4dCgpO1xuXHRcdGFzc2V0TG9hZGVyQ29udGV4dC5kZXBlbmRlbmN5QmFzZVVybCA9IFwiYXNzZXRzL3NreWJveC9cIjtcblxuXHRcdC8vZW52aXJvbm1lbnQgdGV4dHVyZVxuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL3NreWJveC9zbm93X3RleHR1cmUuY3ViZVwiKSwgYXNzZXRMb2FkZXJDb250ZXh0KTtcblx0fVxuXG5cblx0LyoqXG5cdCAqIE5hdmlnYXRpb24gYW5kIHJlbmRlciBsb29wXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShkdDpudW1iZXIpOnZvaWRcblx0e1xuXHRcdHRoaXMuX3RvcnVzLnJvdGF0aW9uWCArPSAyO1xuXHRcdHRoaXMuX3RvcnVzLnJvdGF0aW9uWSArPSAxO1xuXG5cdFx0dGhpcy5fdmlldy5jYW1lcmEudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IFZlY3RvcjNEKCk7XG5cdFx0dGhpcy5fdmlldy5jYW1lcmEucm90YXRpb25ZICs9IDAuNSoodGhpcy5fbW91c2VYIC0gd2luZG93LmlubmVyV2lkdGgvMikvODAwO1xuXHRcdHRoaXMuX3ZpZXcuY2FtZXJhLnRyYW5zZm9ybS5tb3ZlQmFja3dhcmQoNjAwKTtcblx0XHR0aGlzLl92aWV3LnJlbmRlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbmVyIGZ1bmN0aW9uIGZvciByZXNvdXJjZSBjb21wbGV0ZSBldmVudCBvbiBhc3NldCBsaWJyYXJ5XG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzb3VyY2VDb21wbGV0ZShldmVudDpMb2FkZXJFdmVudClcblx0e1xuXHRcdHN3aXRjaCAoZXZlbnQudXJsKVxuXHRcdHtcblx0XHRcdGNhc2UgJ2Fzc2V0cy9za3lib3gvc25vd190ZXh0dXJlLmN1YmUnOlxuXHRcdFx0XHR0aGlzLl9jdWJlVGV4dHVyZSA9IDxJbWFnZUN1YmVUZXh0dXJlPiBldmVudC5hc3NldHNbMF07XG5cblx0XHRcdFx0dGhpcy5fc2t5Qm94ID0gbmV3IFNreWJveChuZXcgU2t5Ym94TWF0ZXJpYWwodGhpcy5fY3ViZVRleHR1cmUpKTtcblx0XHRcdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZCh0aGlzLl9za3lCb3gpO1xuXG5cdFx0XHRcdHRoaXMuX3RvcnVzTWF0ZXJpYWwuYWRkRWZmZWN0TWV0aG9kKG5ldyBFZmZlY3RFbnZNYXBNZXRob2QodGhpcy5fY3ViZVRleHR1cmUsIDEpKTtcblxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgbW92ZSBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlTW92ZShldmVudDpNb3VzZUV2ZW50KVxuXHR7XG5cdFx0dGhpcy5fbW91c2VYID0gZXZlbnQuY2xpZW50WDtcblx0XHR0aGlzLl9tb3VzZVkgPSBldmVudC5jbGllbnRZO1xuXHR9XG5cblx0LyoqXG5cdCAqIHdpbmRvdyBsaXN0ZW5lciBmb3IgcmVzaXplIGV2ZW50c1xuXHQgKi9cblx0cHJpdmF0ZSBvblJlc2l6ZShldmVudDpVSUV2ZW50ID0gbnVsbCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5fdmlldy55ID0gMDtcblx0XHR0aGlzLl92aWV3LnggPSAwO1xuXHRcdHRoaXMuX3ZpZXcud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHR0aGlzLl92aWV3LmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblx0fVxufVxuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKVxue1xuXHRuZXcgQmFzaWNfU2t5Qm94KCk7XG59Il19