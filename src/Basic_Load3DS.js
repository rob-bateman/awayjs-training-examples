/*

3ds file loading example in Away3d

Demonstrates:

How to use the Loader object to load an embedded internal 3ds model.
How to map an external asset reference inside a file to an internal embedded asset.
How to extract material data and use it to set custom material properties on a model.

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
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetLoaderContext = require("awayjs-core/lib/library/AssetLoaderContext");
var AssetType = require("awayjs-core/lib/library/AssetType");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var Loader = require("awayjs-display/lib/containers/Loader");
var View = require("awayjs-display/lib/containers/View");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var DirectionalLight = require("awayjs-display/lib/entities/DirectionalLight");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var PrimitivePlanePrefab = require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
var DefaultRenderer = require("awayjs-stagegl/lib/render/DefaultRenderer");
var TriangleMethodMaterial = require("awayjs-stagegl/lib/materials/TriangleMethodMaterial");
var Max3DSParser = require("awayjs-renderergl/lib/parsers/Max3DSParser");
var ShadowSoftMethod = require("awayjs-renderergl/lib/materials/methods/ShadowSoftMethod");
var Basic_Load3DS = (function () {
    /**
     * Constructor
     */
    function Basic_Load3DS() {
        this._time = 0;
        this._move = false;
        this.init();
    }
    /**
     * Global initialise function
     */
    Basic_Load3DS.prototype.init = function () {
        this.initEngine();
        this.initLights();
        this.initMaterials();
        this.initObjects();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    Basic_Load3DS.prototype.initEngine = function () {
        this._view = new View(new DefaultRenderer());
        //setup the camera for optimal shadow rendering
        this._view.camera.projection.far = 2100;
        //setup controller to be used on the camera
        this._cameraController = new HoverController(this._view.camera, null, 45, 20, 1000, 10);
    };
    /**
     * Initialise the lights
     */
    Basic_Load3DS.prototype.initLights = function () {
        this._light = new DirectionalLight(-1, -1, 1);
        this._direction = new Vector3D(-1, -1, 1);
        this._lightPicker = new StaticLightPicker([this._light]);
        this._view.scene.addChild(this._light);
    };
    /**
     * Initialise the materials
     */
    Basic_Load3DS.prototype.initMaterials = function () {
        this._groundMaterial = new TriangleMethodMaterial();
        this._groundMaterial.shadowMethod = new ShadowSoftMethod(this._light, 10, 5);
        this._groundMaterial.shadowMethod.epsilon = 0.2;
        this._groundMaterial.lightPicker = this._lightPicker;
        this._groundMaterial.specular = 0;
    };
    /**
     * Initialise the scene objects
     */
    Basic_Load3DS.prototype.initObjects = function () {
        this._loader = new Loader();
        this._loader.transform.scale = new Vector3D(300, 300, 300);
        this._loader.z = -200;
        this._view.scene.addChild(this._loader);
        this._plane = new PrimitivePlanePrefab(1000, 1000);
        this._ground = this._plane.getNewObject();
        this._ground.material = this._groundMaterial;
        this._ground.castsShadows = false;
        this._view.scene.addChild(this._ground);
    };
    /**
     * Initialise the listeners
     */
    Basic_Load3DS.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) { return _this.onResize(event); };
        document.onmousedown = function (event) { return _this.onMouseDown(event); };
        document.onmouseup = function (event) { return _this.onMouseUp(event); };
        document.onmousemove = function (event) { return _this.onMouseMove(event); };
        this.onResize();
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
        //setup the url map for textures in the 3ds file
        var assetLoaderContext = new AssetLoaderContext();
        assetLoaderContext.mapUrl("texture.jpg", "assets/soldier_ant.jpg");
        this._loader.addEventListener(AssetEvent.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
        this._loader.load(new URLRequest("assets/soldier_ant.3ds"), assetLoaderContext, null, new Max3DSParser(false));
        AssetLibrary.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        AssetLibrary.load(new URLRequest("assets/CoarseRedSand.jpg"));
    };
    /**
     * Navigation and render loop
     */
    Basic_Load3DS.prototype.onEnterFrame = function (dt) {
        this._time += dt;
        this._direction.x = -Math.sin(this._time / 4000);
        this._direction.z = -Math.cos(this._time / 4000);
        this._light.direction = this._direction;
        this._view.render();
    };
    /**
     * Listener function for asset complete event on loader
     */
    Basic_Load3DS.prototype.onAssetComplete = function (event) {
        var asset = event.asset;
        switch (asset.assetType) {
            case AssetType.MESH:
                var mesh = event.asset;
                mesh.castsShadows = true;
                break;
            case AssetType.MATERIAL:
                var material = event.asset;
                material.shadowMethod = new ShadowSoftMethod(this._light, 10, 5);
                material.shadowMethod.epsilon = 0.2;
                material.lightPicker = this._lightPicker;
                material.gloss = 30;
                material.specular = 1;
                material.color = 0x303040;
                material.ambient = 1;
                break;
        }
    };
    /**
     * Listener function for resource complete event on asset library
     */
    Basic_Load3DS.prototype.onResourceComplete = function (event) {
        var assets = event.assets;
        var length = assets.length;
        for (var c = 0; c < length; c++) {
            var asset = assets[c];
            console.log(asset.name, event.url);
            switch (event.url) {
                case "assets/CoarseRedSand.jpg":
                    this._groundMaterial.texture = asset;
                    break;
            }
        }
    };
    /**
     * Mouse down listener for navigation
     */
    Basic_Load3DS.prototype.onMouseDown = function (event) {
        this._lastPanAngle = this._cameraController.panAngle;
        this._lastTiltAngle = this._cameraController.tiltAngle;
        this._lastMouseX = event.clientX;
        this._lastMouseY = event.clientY;
        this._move = true;
    };
    /**
     * Mouse up listener for navigation
     */
    Basic_Load3DS.prototype.onMouseUp = function (event) {
        this._move = false;
    };
    Basic_Load3DS.prototype.onMouseMove = function (event) {
        if (this._move) {
            this._cameraController.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
            this._cameraController.tiltAngle = 0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
        }
    };
    /**
     * stage listener for resize events
     */
    Basic_Load3DS.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return Basic_Load3DS;
})();
window.onload = function () {
    new Basic_Load3DS();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9CYXNpY19Mb2FkM0RTLnRzIl0sIm5hbWVzIjpbIkJhc2ljX0xvYWQzRFMiLCJCYXNpY19Mb2FkM0RTLmNvbnN0cnVjdG9yIiwiQmFzaWNfTG9hZDNEUy5pbml0IiwiQmFzaWNfTG9hZDNEUy5pbml0RW5naW5lIiwiQmFzaWNfTG9hZDNEUy5pbml0TGlnaHRzIiwiQmFzaWNfTG9hZDNEUy5pbml0TWF0ZXJpYWxzIiwiQmFzaWNfTG9hZDNEUy5pbml0T2JqZWN0cyIsIkJhc2ljX0xvYWQzRFMuaW5pdExpc3RlbmVycyIsIkJhc2ljX0xvYWQzRFMub25FbnRlckZyYW1lIiwiQmFzaWNfTG9hZDNEUy5vbkFzc2V0Q29tcGxldGUiLCJCYXNpY19Mb2FkM0RTLm9uUmVzb3VyY2VDb21wbGV0ZSIsIkJhc2ljX0xvYWQzRFMub25Nb3VzZURvd24iLCJCYXNpY19Mb2FkM0RTLm9uTW91c2VVcCIsIkJhc2ljX0xvYWQzRFMub25Nb3VzZU1vdmUiLCJCYXNpY19Mb2FkM0RTLm9uUmVzaXplIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBb0NFO0FBRUYsSUFBTyxVQUFVLFdBQWUsbUNBQW1DLENBQUMsQ0FBQztBQUNyRSxJQUFPLFdBQVcsV0FBZSxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3ZFLElBQU8sUUFBUSxXQUFnQiwrQkFBK0IsQ0FBQyxDQUFDO0FBQ2hFLElBQU8sWUFBWSxXQUFlLHNDQUFzQyxDQUFDLENBQUM7QUFDMUUsSUFBTyxrQkFBa0IsV0FBYSw0Q0FBNEMsQ0FBQyxDQUFDO0FBQ3BGLElBQU8sU0FBUyxXQUFlLG1DQUFtQyxDQUFDLENBQUM7QUFFcEUsSUFBTyxVQUFVLFdBQWUsZ0NBQWdDLENBQUMsQ0FBQztBQUVsRSxJQUFPLHFCQUFxQixXQUFZLDZDQUE2QyxDQUFDLENBQUM7QUFFdkYsSUFBTyxNQUFNLFdBQWdCLHNDQUFzQyxDQUFDLENBQUM7QUFDckUsSUFBTyxJQUFJLFdBQWlCLG9DQUFv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cyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5cbjNkcyBmaWxlIGxvYWRpbmcgZXhhbXBsZSBpbiBBd2F5M2RcblxuRGVtb25zdHJhdGVzOlxuXG5Ib3cgdG8gdXNlIHRoZSBMb2FkZXIgb2JqZWN0IHRvIGxvYWQgYW4gZW1iZWRkZWQgaW50ZXJuYWwgM2RzIG1vZGVsLlxuSG93IHRvIG1hcCBhbiBleHRlcm5hbCBhc3NldCByZWZlcmVuY2UgaW5zaWRlIGEgZmlsZSB0byBhbiBpbnRlcm5hbCBlbWJlZGRlZCBhc3NldC5cbkhvdyB0byBleHRyYWN0IG1hdGVyaWFsIGRhdGEgYW5kIHVzZSBpdCB0byBzZXQgY3VzdG9tIG1hdGVyaWFsIHByb3BlcnRpZXMgb24gYSBtb2RlbC5cblxuQ29kZSBieSBSb2IgQmF0ZW1hblxucm9iQGluZmluaXRldHVydGxlcy5jby51a1xuaHR0cDovL3d3dy5pbmZpbml0ZXR1cnRsZXMuY28udWtcblxuVGhpcyBjb2RlIGlzIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuXG5Db3B5cmlnaHQgKGMpIFRoZSBBd2F5IEZvdW5kYXRpb24gaHR0cDovL3d3dy50aGVhd2F5Zm91bmRhdGlvbi5vcmdcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUg4oCcU29mdHdhcmXigJ0pLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIOKAnEFTIElT4oCdLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cblRIRSBTT0ZUV0FSRS5cblxuKi9cblxuaW1wb3J0IEFzc2V0RXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Bc3NldEV2ZW50XCIpO1xuaW1wb3J0IExvYWRlckV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvTG9hZGVyRXZlbnRcIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMaWJyYXJ5XCIpO1xuaW1wb3J0IEFzc2V0TG9hZGVyQ29udGV4dFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TG9hZGVyQ29udGV4dFwiKTtcbmltcG9ydCBBc3NldFR5cGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRUeXBlXCIpO1xuaW1wb3J0IElBc3NldFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0lBc3NldFwiKTtcbmltcG9ydCBVUkxSZXF1ZXN0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMUmVxdWVzdFwiKTtcbmltcG9ydCBUZXh0dXJlMkRCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvVGV4dHVyZTJEQmFzZVwiKTtcbmltcG9ydCBSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL1JlcXVlc3RBbmltYXRpb25GcmFtZVwiKTtcblxuaW1wb3J0IExvYWRlclx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL0xvYWRlclwiKTtcbmltcG9ydCBWaWV3XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9WaWV3XCIpO1xuaW1wb3J0IEhvdmVyQ29udHJvbGxlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRyb2xsZXJzL0hvdmVyQ29udHJvbGxlclwiKTtcbmltcG9ydCBEaXJlY3Rpb25hbExpZ2h0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvRGlyZWN0aW9uYWxMaWdodFwiKTtcbmltcG9ydCBNZXNoXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTWVzaFwiKTtcbmltcG9ydCBTdGF0aWNMaWdodFBpY2tlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvbGlnaHRwaWNrZXJzL1N0YXRpY0xpZ2h0UGlja2VyXCIpO1xuaW1wb3J0IFByaW1pdGl2ZVBsYW5lUHJlZmFiXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3ByZWZhYnMvUHJpbWl0aXZlUGxhbmVQcmVmYWJcIik7XG5cbmltcG9ydCBEZWZhdWx0UmVuZGVyZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9yZW5kZXIvRGVmYXVsdFJlbmRlcmVyXCIpO1xuaW1wb3J0IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWxcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9UcmlhbmdsZU1ldGhvZE1hdGVyaWFsXCIpO1xuXG5pbXBvcnQgTWF4M0RTUGFyc2VyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9wYXJzZXJzL01heDNEU1BhcnNlclwiKTtcbmltcG9ydCBTaGFkb3dTb2Z0TWV0aG9kXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU2hhZG93U29mdE1ldGhvZFwiKTtcblxuY2xhc3MgQmFzaWNfTG9hZDNEU1xue1xuXHQvL2VuZ2luZSB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfdmlldzpWaWV3O1xuXHRwcml2YXRlIF9jYW1lcmFDb250cm9sbGVyOkhvdmVyQ29udHJvbGxlcjtcblxuXHQvL21hdGVyaWFsIG9iamVjdHNcblx0cHJpdmF0ZSBfZ3JvdW5kTWF0ZXJpYWw6VHJpYW5nbGVNZXRob2RNYXRlcmlhbDtcblxuXHQvL2xpZ2h0IG9iamVjdHNcblx0cHJpdmF0ZSBfbGlnaHQ6RGlyZWN0aW9uYWxMaWdodDtcblx0cHJpdmF0ZSBfbGlnaHRQaWNrZXI6U3RhdGljTGlnaHRQaWNrZXI7XG5cdHByaXZhdGUgX2RpcmVjdGlvbjpWZWN0b3IzRDtcblxuXHQvL3NjZW5lIG9iamVjdHNcblx0cHJpdmF0ZSBfbG9hZGVyOkxvYWRlcjtcblx0cHJpdmF0ZSBfcGxhbmU6UHJpbWl0aXZlUGxhbmVQcmVmYWI7XG5cdHByaXZhdGUgX2dyb3VuZDpNZXNoO1xuXG5cdC8vbmF2aWdhdGlvbiB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfdGltZXI6UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXHRwcml2YXRlIF90aW1lOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX21vdmU6Ym9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIF9sYXN0UGFuQW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIF9sYXN0VGlsdEFuZ2xlOm51bWJlcjtcblx0cHJpdmF0ZSBfbGFzdE1vdXNlWDpudW1iZXI7XG5cdHByaXZhdGUgX2xhc3RNb3VzZVk6bnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKi9cblx0Y29uc3RydWN0b3IoKVxuXHR7XG5cdFx0dGhpcy5pbml0KCk7XG5cdH1cblxuXHQvKipcblx0ICogR2xvYmFsIGluaXRpYWxpc2UgZnVuY3Rpb25cblx0ICovXG5cdHByaXZhdGUgaW5pdCgpOnZvaWRcblx0e1xuXHRcdHRoaXMuaW5pdEVuZ2luZSgpO1xuXHRcdHRoaXMuaW5pdExpZ2h0cygpO1xuXHRcdHRoaXMuaW5pdE1hdGVyaWFscygpO1xuXHRcdHRoaXMuaW5pdE9iamVjdHMoKTtcblx0XHR0aGlzLmluaXRMaXN0ZW5lcnMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBlbmdpbmVcblx0ICovXG5cdHByaXZhdGUgaW5pdEVuZ2luZSgpOnZvaWRcblx0e1xuXHRcdHRoaXMuX3ZpZXcgPSBuZXcgVmlldyhuZXcgRGVmYXVsdFJlbmRlcmVyKCkpO1xuXG5cdFx0Ly9zZXR1cCB0aGUgY2FtZXJhIGZvciBvcHRpbWFsIHNoYWRvdyByZW5kZXJpbmdcblx0XHR0aGlzLl92aWV3LmNhbWVyYS5wcm9qZWN0aW9uLmZhciA9IDIxMDA7XG5cblx0XHQvL3NldHVwIGNvbnRyb2xsZXIgdG8gYmUgdXNlZCBvbiB0aGUgY2FtZXJhXG5cdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlciA9IG5ldyBIb3ZlckNvbnRyb2xsZXIodGhpcy5fdmlldy5jYW1lcmEsIG51bGwsIDQ1LCAyMCwgMTAwMCwgMTApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpZ2h0c1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlnaHRzKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5fbGlnaHQgPSBuZXcgRGlyZWN0aW9uYWxMaWdodCgtMSwgLTEsIDEpO1xuXHRcdHRoaXMuX2RpcmVjdGlvbiA9IG5ldyBWZWN0b3IzRCgtMSwgLTEsIDEpO1xuXHRcdHRoaXMuX2xpZ2h0UGlja2VyID0gbmV3IFN0YXRpY0xpZ2h0UGlja2VyKFt0aGlzLl9saWdodF0pO1xuXHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQodGhpcy5fbGlnaHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIG1hdGVyaWFsc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TWF0ZXJpYWxzKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5fZ3JvdW5kTWF0ZXJpYWwgPSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuX2dyb3VuZE1hdGVyaWFsLnNoYWRvd01ldGhvZCA9IG5ldyBTaGFkb3dTb2Z0TWV0aG9kKHRoaXMuX2xpZ2h0ICwgMTAgLCA1ICk7XG5cdFx0dGhpcy5fZ3JvdW5kTWF0ZXJpYWwuc2hhZG93TWV0aG9kLmVwc2lsb24gPSAwLjI7XG5cdFx0dGhpcy5fZ3JvdW5kTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcblx0XHR0aGlzLl9ncm91bmRNYXRlcmlhbC5zcGVjdWxhciA9IDA7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgc2NlbmUgb2JqZWN0c1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0T2JqZWN0cygpOnZvaWRcblx0e1xuXHRcdHRoaXMuX2xvYWRlciA9IG5ldyBMb2FkZXIoKTtcblx0XHR0aGlzLl9sb2FkZXIudHJhbnNmb3JtLnNjYWxlID0gbmV3IFZlY3RvcjNEKDMwMCwgMzAwLCAzMDApO1xuXHRcdHRoaXMuX2xvYWRlci56ID0gLTIwMDtcblx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKHRoaXMuX2xvYWRlcik7XG5cblx0XHR0aGlzLl9wbGFuZSA9IG5ldyBQcmltaXRpdmVQbGFuZVByZWZhYigxMDAwLCAxMDAwKVxuXHRcdHRoaXMuX2dyb3VuZCA9IDxNZXNoPiB0aGlzLl9wbGFuZS5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLl9ncm91bmQubWF0ZXJpYWwgPSB0aGlzLl9ncm91bmRNYXRlcmlhbDtcblx0XHR0aGlzLl9ncm91bmQuY2FzdHNTaGFkb3dzID0gZmFsc2U7XG5cdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZCh0aGlzLl9ncm91bmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpc3RlbmVyc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlzdGVuZXJzKCk6dm9pZFxuXHR7XG5cdFx0d2luZG93Lm9ucmVzaXplICA9IChldmVudDpVSUV2ZW50KSA9PiB0aGlzLm9uUmVzaXplKGV2ZW50KTtcblxuXHRcdGRvY3VtZW50Lm9ubW91c2Vkb3duID0gKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZURvd24oZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2V1cCA9IChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VVcChldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZW1vdmUgPSAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlTW92ZShldmVudCk7XG5cblx0XHR0aGlzLm9uUmVzaXplKCk7XG5cblx0XHR0aGlzLl90aW1lciA9IG5ldyBSZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkVudGVyRnJhbWUsIHRoaXMpO1xuXHRcdHRoaXMuX3RpbWVyLnN0YXJ0KCk7XG5cblx0XHQvL3NldHVwIHRoZSB1cmwgbWFwIGZvciB0ZXh0dXJlcyBpbiB0aGUgM2RzIGZpbGVcblx0XHR2YXIgYXNzZXRMb2FkZXJDb250ZXh0OkFzc2V0TG9hZGVyQ29udGV4dCA9IG5ldyBBc3NldExvYWRlckNvbnRleHQoKTtcblx0XHRhc3NldExvYWRlckNvbnRleHQubWFwVXJsKFwidGV4dHVyZS5qcGdcIiwgXCJhc3NldHMvc29sZGllcl9hbnQuanBnXCIpO1xuXG5cdFx0dGhpcy5fbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoQXNzZXRFdmVudC5BU1NFVF9DT01QTEVURSwgKGV2ZW50OkFzc2V0RXZlbnQpID0+IHRoaXMub25Bc3NldENvbXBsZXRlKGV2ZW50KSk7XG5cdFx0dGhpcy5fbG9hZGVyLmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvc29sZGllcl9hbnQuM2RzXCIpLCBhc3NldExvYWRlckNvbnRleHQsIG51bGwsIG5ldyBNYXgzRFNQYXJzZXIoZmFsc2UpKTtcblxuXHRcdEFzc2V0TGlicmFyeS5hZGRFdmVudExpc3RlbmVyKExvYWRlckV2ZW50LlJFU09VUkNFX0NPTVBMRVRFLCAoZXZlbnQ6TG9hZGVyRXZlbnQpID0+IHRoaXMub25SZXNvdXJjZUNvbXBsZXRlKGV2ZW50KSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvQ29hcnNlUmVkU2FuZC5qcGdcIikpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRpb24gYW5kIHJlbmRlciBsb29wXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShkdDpudW1iZXIpOnZvaWRcblx0e1xuXHRcdHRoaXMuX3RpbWUgKz0gZHQ7XG5cblx0XHR0aGlzLl9kaXJlY3Rpb24ueCA9IC1NYXRoLnNpbih0aGlzLl90aW1lLzQwMDApO1xuXHRcdHRoaXMuX2RpcmVjdGlvbi56ID0gLU1hdGguY29zKHRoaXMuX3RpbWUvNDAwMCk7XG5cdFx0dGhpcy5fbGlnaHQuZGlyZWN0aW9uID0gdGhpcy5fZGlyZWN0aW9uO1xuXG5cdFx0dGhpcy5fdmlldy5yZW5kZXIoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBMaXN0ZW5lciBmdW5jdGlvbiBmb3IgYXNzZXQgY29tcGxldGUgZXZlbnQgb24gbG9hZGVyXG5cdCAqL1xuXHRwcml2YXRlIG9uQXNzZXRDb21wbGV0ZShldmVudDpBc3NldEV2ZW50KVxuXHR7XG5cdFx0dmFyIGFzc2V0OklBc3NldCA9IGV2ZW50LmFzc2V0O1xuXG5cdFx0c3dpdGNoIChhc3NldC5hc3NldFR5cGUpXG5cdFx0e1xuXHRcdFx0Y2FzZSBBc3NldFR5cGUuTUVTSCA6XG5cdFx0XHRcdHZhciBtZXNoOk1lc2ggPSA8TWVzaD4gZXZlbnQuYXNzZXQ7XG5cdFx0XHRcdG1lc2guY2FzdHNTaGFkb3dzID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEFzc2V0VHlwZS5NQVRFUklBTCA6XG5cdFx0XHRcdHZhciBtYXRlcmlhbDpUcmlhbmdsZU1ldGhvZE1hdGVyaWFsID0gPFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWw+IGV2ZW50LmFzc2V0O1xuXHRcdFx0XHRtYXRlcmlhbC5zaGFkb3dNZXRob2QgPSBuZXcgU2hhZG93U29mdE1ldGhvZCh0aGlzLl9saWdodCAsIDEwICwgNSApO1xuXHRcdFx0XHRtYXRlcmlhbC5zaGFkb3dNZXRob2QuZXBzaWxvbiA9IDAuMjtcblx0XHRcdFx0bWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcblx0XHRcdFx0bWF0ZXJpYWwuZ2xvc3MgPSAzMDtcblx0XHRcdFx0bWF0ZXJpYWwuc3BlY3VsYXIgPSAxO1xuXHRcdFx0XHRtYXRlcmlhbC5jb2xvciA9IDB4MzAzMDQwO1xuXHRcdFx0XHRtYXRlcmlhbC5hbWJpZW50ID0gMTtcblxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTGlzdGVuZXIgZnVuY3Rpb24gZm9yIHJlc291cmNlIGNvbXBsZXRlIGV2ZW50IG9uIGFzc2V0IGxpYnJhcnlcblx0ICovXG5cdHByaXZhdGUgb25SZXNvdXJjZUNvbXBsZXRlIChldmVudDpMb2FkZXJFdmVudClcblx0e1xuXHRcdHZhciBhc3NldHM6QXJyYXk8SUFzc2V0PiA9IGV2ZW50LmFzc2V0cztcblx0XHR2YXIgbGVuZ3RoOm51bWJlciA9IGFzc2V0cy5sZW5ndGg7XG5cblx0XHRmb3IgKHZhciBjOm51bWJlciA9IDA7IGMgPCBsZW5ndGg7IGMgKyspIHtcblx0XHRcdHZhciBhc3NldDpJQXNzZXQgPSBhc3NldHNbY107XG5cblx0XHRcdGNvbnNvbGUubG9nKGFzc2V0Lm5hbWUsIGV2ZW50LnVybCk7XG5cblx0XHRcdHN3aXRjaCAoZXZlbnQudXJsKSB7XG5cdFx0XHRcdC8vcGxhbmUgdGV4dHVyZXNcblx0XHRcdFx0Y2FzZSBcImFzc2V0cy9Db2Fyc2VSZWRTYW5kLmpwZ1wiIDpcblx0XHRcdFx0XHR0aGlzLl9ncm91bmRNYXRlcmlhbC50ZXh0dXJlID0gPFRleHR1cmUyREJhc2U+IGFzc2V0O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSBkb3duIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VEb3duKGV2ZW50Ok1vdXNlRXZlbnQpOnZvaWRcblx0e1xuXHRcdHRoaXMuX2xhc3RQYW5BbmdsZSA9IHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGU7XG5cdFx0dGhpcy5fbGFzdFRpbHRBbmdsZSA9IHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlO1xuXHRcdHRoaXMuX2xhc3RNb3VzZVggPSBldmVudC5jbGllbnRYO1xuXHRcdHRoaXMuX2xhc3RNb3VzZVkgPSBldmVudC5jbGllbnRZO1xuXHRcdHRoaXMuX21vdmUgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIHVwIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VVcChldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR0aGlzLl9tb3ZlID0gZmFsc2U7XG5cdH1cblxuXHRwcml2YXRlIG9uTW91c2VNb3ZlKGV2ZW50Ok1vdXNlRXZlbnQpXG5cdHtcblx0XHRpZiAodGhpcy5fbW92ZSkge1xuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZSA9IDAuMyooZXZlbnQuY2xpZW50WCAtIHRoaXMuX2xhc3RNb3VzZVgpICsgdGhpcy5fbGFzdFBhbkFuZ2xlO1xuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFkgLSB0aGlzLl9sYXN0TW91c2VZKSArIHRoaXMuX2xhc3RUaWx0QW5nbGU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIHN0YWdlIGxpc3RlbmVyIGZvciByZXNpemUgZXZlbnRzXG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzaXplKGV2ZW50OlVJRXZlbnQgPSBudWxsKTp2b2lkXG5cdHtcblx0XHR0aGlzLl92aWV3LnkgPSAwO1xuXHRcdHRoaXMuX3ZpZXcueCA9IDA7XG5cdFx0dGhpcy5fdmlldy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdHRoaXMuX3ZpZXcuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHR9XG59XG5cblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpXG57XG5cdG5ldyBCYXNpY19Mb2FkM0RTKCk7XG59Il19