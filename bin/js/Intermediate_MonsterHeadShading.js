webpackJsonp([15],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	
	Monster Head example in Away3d
	
	Demonstrates:
	
	How to use the AssetLibrary to load an internal AWD model.
	How to set custom material methods on a model.
	How to setup soft shadows and multiple lightsources with a multipass texture
	How to use a diffuse gradient method as a cheap way to simulate sub-surface scattering
	
	Code by Rob Bateman & David Lenaerts
	rob@infiniteturtles.co.uk
	http://www.infiniteturtles.co.uk
	david.lenaerts@gmail.com
	http://www.derschmale.com
	
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
	"use strict";
	var Sampler2D_1 = __webpack_require__(78);
	var SpecularImage2D_1 = __webpack_require__(327);
	var AssetEvent_1 = __webpack_require__(1);
	var URLLoaderEvent_1 = __webpack_require__(121);
	var LoaderEvent_1 = __webpack_require__(5);
	var Vector3D_1 = __webpack_require__(18);
	var AssetLibrary_1 = __webpack_require__(307);
	var LoaderContext_1 = __webpack_require__(329);
	var URLLoader_1 = __webpack_require__(118);
	var URLLoaderDataFormat_1 = __webpack_require__(119);
	var URLRequest_1 = __webpack_require__(3);
	var ParserUtils_1 = __webpack_require__(217);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var Scene_1 = __webpack_require__(11);
	var View_1 = __webpack_require__(9);
	var HoverController_1 = __webpack_require__(111);
	var Camera_1 = __webpack_require__(45);
	var DirectionalLight_1 = __webpack_require__(221);
	var PointLight_1 = __webpack_require__(227);
	var Sprite_1 = __webpack_require__(57);
	var StaticLightPicker_1 = __webpack_require__(229);
	var Single2DTexture_1 = __webpack_require__(103);
	var DefaultRenderer_1 = __webpack_require__(129);
	var MethodMaterial_1 = __webpack_require__(267);
	var MethodMaterialMode_1 = __webpack_require__(266);
	var SpecularFresnelMethod_1 = __webpack_require__(296);
	var ShadowSoftMethod_1 = __webpack_require__(303);
	var AWDParser_1 = __webpack_require__(214);
	var Intermediate_MonsterHeadShading = (function () {
	    /**
	     * Constructor
	     */
	    function Intermediate_MonsterHeadShading() {
	        //textures
	        this._textureStrings = Array("monsterhead_diffuse.jpg", "monsterhead_specular.jpg", "monsterhead_normals.jpg");
	        this._textureDictionary = new Object();
	        this._advancedMethod = true;
	        //loading variables
	        this._numTextures = 0;
	        this._currentTexture = 0;
	        this._n = 0;
	        //root filepath for asset loading
	        this._assetsRoot = "assets/monsterhead/";
	        //navigation variables
	        this._move = false;
	        this.time = 0;
	        this._shadowRange = 3;
	        this._lightDirection = 120 * Math.PI / 180;
	        this._lightElevation = 30 * Math.PI / 180;
	        this.init();
	    }
	    /**
	     * Global initialise function
	     */
	    Intermediate_MonsterHeadShading.prototype.init = function () {
	        this.initEngine();
	        this.initLights();
	        this.initListeners();
	        //kickoff asset loading
	        this._n = 0;
	        this._numTextures = this._textureStrings.length;
	        this.load(this._textureStrings[this._n]);
	    };
	    /**
	     * Initialise the engine
	     */
	    Intermediate_MonsterHeadShading.prototype.initEngine = function () {
	        this._scene = new Scene_1.default();
	        this._camera = new Camera_1.default();
	        this._camera.projection.near = 20;
	        this._camera.projection.far = 1000;
	        this._view = new View_1.default(new DefaultRenderer_1.default(), this._scene, this._camera);
	        //setup controller to be used on the camera
	        this._cameraController = new HoverController_1.default(this._camera, null, 225, 10, 800);
	        this._cameraController.yFactor = 1;
	    };
	    /**
	     * Initialise the lights in a scene
	     */
	    Intermediate_MonsterHeadShading.prototype.initLights = function () {
	        //var initialAzimuth:number = .6;
	        //var initialArc:number = 2;
	        var x = Math.sin(this._lightElevation) * Math.cos(this._lightDirection);
	        var y = -Math.cos(this._lightElevation);
	        var z = Math.sin(this._lightElevation) * Math.sin(this._lightDirection);
	        // main light casting the shadows
	        this._directionalLight = new DirectionalLight_1.default(x, y, z);
	        this._directionalLight.color = 0xffeedd;
	        this._directionalLight.ambient = 1;
	        this._directionalLight.specular = .3;
	        this._directionalLight.ambientColor = 0x101025;
	        this._directionalLight.shadowsEnabled = true;
	        this._directionalLight.shadowMapper.lightOffset = 1000;
	        this._scene.addChild(this._directionalLight);
	        // blue point light coming from the right
	        this._blueLight = new PointLight_1.default();
	        this._blueLight.color = 0x4080ff;
	        this._blueLight.x = 3000;
	        this._blueLight.z = 700;
	        this._blueLight.y = 20;
	        this._scene.addChild(this._blueLight);
	        // red light coming from the left
	        this._redLight = new PointLight_1.default();
	        this._redLight.color = 0x802010;
	        this._redLight.x = -2000;
	        this._redLight.z = 800;
	        this._redLight.y = -400;
	        this._scene.addChild(this._redLight);
	        this._lightPicker = new StaticLightPicker_1.default([this._directionalLight, this._blueLight, this._redLight]);
	    };
	    /**
	     * Initialise the listeners
	     */
	    Intermediate_MonsterHeadShading.prototype.initListeners = function () {
	        var _this = this;
	        window.onresize = function (event) { return _this.onResize(event); };
	        document.onmousedown = function (event) { return _this.onMouseDown(event); };
	        document.onmouseup = function (event) { return _this.onMouseUp(event); };
	        document.onmousemove = function (event) { return _this.onMouseMove(event); };
	        this.onResize();
	        this.parseAWDDelegate = function (event) { return _this.parseAWD(event); };
	        this.parseBitmapDelegate = function (event) { return _this.parseBitmap(event); };
	        this.loadProgressDelegate = function (event) { return _this.loadProgress(event); };
	        this.onBitmapCompleteDelegate = function (event) { return _this.onBitmapComplete(event); };
	        this.onAssetCompleteDelegate = function (event) { return _this.onAssetComplete(event); };
	        this.onResourceCompleteDelegate = function (event) { return _this.onResourceComplete(event); };
	        this.timer = new RequestAnimationFrame_1.default(this.onEnterFrame, this);
	        this.timer.start();
	    };
	    /**
	     * Updates the direction of the directional lightsource
	     */
	    Intermediate_MonsterHeadShading.prototype.updateDirection = function () {
	        this._directionalLight.direction = new Vector3D_1.default(Math.sin(this._lightElevation) * Math.cos(this._lightDirection), -Math.cos(this._lightElevation), Math.sin(this._lightElevation) * Math.sin(this._lightDirection));
	    };
	    Intermediate_MonsterHeadShading.prototype.updateRange = function () {
	        this._softShadowMethod.range = this._shadowRange;
	    };
	    /**
	     * Global binary file loader
	     */
	    Intermediate_MonsterHeadShading.prototype.load = function (url) {
	        var loader = new URLLoader_1.default();
	        switch (url.substring(url.length - 3)) {
	            case "AWD":
	            case "awd":
	                loader.dataFormat = URLLoaderDataFormat_1.default.ARRAY_BUFFER;
	                this._loadingText = "Loading Model";
	                loader.addEventListener(URLLoaderEvent_1.default.LOAD_COMPLETE, this.parseAWDDelegate);
	                break;
	            case "png":
	            case "jpg":
	                loader.dataFormat = URLLoaderDataFormat_1.default.BLOB;
	                this._currentTexture++;
	                this._loadingText = "Loading Textures";
	                loader.addEventListener(URLLoaderEvent_1.default.LOAD_COMPLETE, this.parseBitmapDelegate);
	                break;
	        }
	        loader.addEventListener(URLLoaderEvent_1.default.LOAD_PROGRESS, this.loadProgressDelegate);
	        loader.load(new URLRequest_1.default(this._assetsRoot + url));
	    };
	    /**
	     * Display current load
	     */
	    Intermediate_MonsterHeadShading.prototype.loadProgress = function (event) {
	        //TODO work out why the casting on URLLoaderEvent fails for bytesLoaded and bytesTotal properties
	        var P = Math.floor(event["bytesLoaded"] / event["bytesTotal"] * 100);
	        if (P != 100) {
	            console.log(this._loadingText + '\n' + ((this._loadingText == "Loading Model") ? Math.floor((event["bytesLoaded"] / 1024) << 0) + 'kb | ' + Math.floor((event["bytesTotal"] / 1024) << 0) + 'kb' : this._currentTexture + ' | ' + this._numTextures));
	        }
	    };
	    /**
	     * Parses the Bitmap file
	     */
	    Intermediate_MonsterHeadShading.prototype.parseBitmap = function (event) {
	        var urlLoader = event.target;
	        var image = ParserUtils_1.default.blobToImage(urlLoader.data);
	        image.onload = this.onBitmapCompleteDelegate;
	        urlLoader.removeEventListener(URLLoaderEvent_1.default.LOAD_COMPLETE, this.parseBitmapDelegate);
	        urlLoader.removeEventListener(URLLoaderEvent_1.default.LOAD_PROGRESS, this.loadProgressDelegate);
	        urlLoader = null;
	    };
	    /**
	     * Parses the AWD file
	     */
	    Intermediate_MonsterHeadShading.prototype.parseAWD = function (event) {
	        console.log("Parsing Data");
	        var urlLoader = event.target;
	        //setup parser
	        AssetLibrary_1.default.addEventListener(AssetEvent_1.default.ASSET_COMPLETE, this.onAssetCompleteDelegate);
	        AssetLibrary_1.default.addEventListener(LoaderEvent_1.default.LOAD_COMPLETE, this.onResourceCompleteDelegate);
	        AssetLibrary_1.default.loadData(urlLoader.data, new LoaderContext_1.default(false), null, new AWDParser_1.default());
	        urlLoader.removeEventListener(URLLoaderEvent_1.default.LOAD_PROGRESS, this.loadProgressDelegate);
	        urlLoader.removeEventListener(URLLoaderEvent_1.default.LOAD_COMPLETE, this.parseAWDDelegate);
	        urlLoader = null;
	    };
	    /**
	     * Listener for bitmap complete event on loader
	     */
	    Intermediate_MonsterHeadShading.prototype.onBitmapComplete = function (event) {
	        var image = event.target;
	        image.onload = null;
	        //create bitmap texture in dictionary
	        if (!this._textureDictionary[this._textureStrings[this._n]])
	            this._textureDictionary[this._textureStrings[this._n]] = new Single2DTexture_1.default((this._n == 1) ? new SpecularImage2D_1.default(ParserUtils_1.default.imageToBitmapImage2D(image)) : ParserUtils_1.default.imageToBitmapImage2D(image));
	        this._n++;
	        //switch to next teture set
	        if (this._n < this._textureStrings.length) {
	            this.load(this._textureStrings[this._n]);
	        }
	        else {
	            this.load("MonsterHead.awd");
	        }
	    };
	    /**
	     * Navigation and render loop
	     */
	    Intermediate_MonsterHeadShading.prototype.onEnterFrame = function (dt) {
	        this._view.render();
	    };
	    /**
	     * Listener for asset complete event on loader
	     */
	    Intermediate_MonsterHeadShading.prototype.onAssetComplete = function (event) {
	        if (event.asset.isAsset(Sprite_1.default)) {
	            this._headModel = event.asset;
	            this._headModel.graphics.scale(4);
	            this._headModel.y = -20;
	            this._scene.addChild(this._headModel);
	        }
	    };
	    /**
	     * Triggered once all resources are loaded
	     */
	    Intermediate_MonsterHeadShading.prototype.onResourceComplete = function (e) {
	        var _this = this;
	        AssetLibrary_1.default.removeEventListener(AssetEvent_1.default.ASSET_COMPLETE, this.onAssetCompleteDelegate);
	        AssetLibrary_1.default.removeEventListener(LoaderEvent_1.default.LOAD_COMPLETE, this.onResourceCompleteDelegate);
	        var material = new MethodMaterial_1.default(this._textureDictionary["monsterhead_diffuse.jpg"]);
	        material.shadowMethod = new ShadowSoftMethod_1.default(this._directionalLight, 10, 5);
	        material.shadowMethod.epsilon = 0.2;
	        material.lightPicker = this._lightPicker;
	        material.specularMethod.gloss = 30;
	        material.specularMethod.strength = 1;
	        material.style.color = 0x303040;
	        material.ambientMethod.strength = 1;
	        //setup custom multipass material
	        this._headMaterial = new MethodMaterial_1.default();
	        this._headMaterial.ambientMethod.texture = this._textureDictionary["monsterhead_diffuse.jpg"];
	        this._headMaterial.mode = MethodMaterialMode_1.default.MULTI_PASS;
	        this._headMaterial.style.sampler = new Sampler2D_1.default(true, true);
	        this._headMaterial.normalMethod.texture = this._textureDictionary["monsterhead_normals.jpg"];
	        this._headMaterial.lightPicker = this._lightPicker;
	        this._headMaterial.style.color = 0x303040;
	        this._headMaterial.diffuseMethod.multiply = false;
	        // create soft shadows with a lot of samples for best results. With the current method setup, any more samples would fail to compile
	        this._softShadowMethod = new ShadowSoftMethod_1.default(this._directionalLight, 20);
	        this._softShadowMethod.range = this._shadowRange; // the sample radius defines the softness of the shadows
	        this._softShadowMethod.epsilon = .1;
	        this._headMaterial.shadowMethod = this._softShadowMethod;
	        // create specular reflections that are stronger from the sides
	        this._fresnelMethod = new SpecularFresnelMethod_1.default(true);
	        this._fresnelMethod.fresnelPower = 3;
	        this._headMaterial.specularMethod = this._fresnelMethod;
	        this._headMaterial.specularMethod.texture = this._textureDictionary["monsterhead_specular.jpg"];
	        this._headMaterial.specularMethod.strength = 3;
	        this._headMaterial.specularMethod.gloss = 10;
	        //apply material to head model
	        var len = this._headModel.graphics.count;
	        for (var i = 0; i < len; i++)
	            this._headModel.graphics.getGraphicAt(i).material = this._headMaterial;
	        AssetLibrary_1.default.addEventListener(LoaderEvent_1.default.LOAD_COMPLETE, function (event) { return _this.onExtraResourceComplete(event); });
	        //diffuse gradient texture
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/diffuseGradient.jpg"));
	    };
	    /**
	     * Triggered once extra resources are loaded
	     */
	    Intermediate_MonsterHeadShading.prototype.onExtraResourceComplete = function (event) {
	        switch (event.url) {
	            case "assets/diffuseGradient.jpg":
	                // very low-cost and crude subsurface scattering for diffuse shading
	                //this._headMaterial.diffuseMethod = new DiffuseGradientMethod(<Single2DTexture> event.assets[ 0 ]);
	                break;
	        }
	    };
	    /**
	     * Mouse down listener for navigation
	     */
	    Intermediate_MonsterHeadShading.prototype.onMouseDown = function (event) {
	        this._lastPanAngle = this._cameraController.panAngle;
	        this._lastTiltAngle = this._cameraController.tiltAngle;
	        this._lastMouseX = event.clientX;
	        this._lastMouseY = event.clientY;
	        this._move = true;
	    };
	    /**
	     * Mouse up listener for navigation
	     */
	    Intermediate_MonsterHeadShading.prototype.onMouseUp = function (event) {
	        this._move = false;
	    };
	    /**
	     * Mouse move listener for mouseLock
	     */
	    Intermediate_MonsterHeadShading.prototype.onMouseMove = function (event) {
	        if (this._move) {
	            this._cameraController.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
	            this._cameraController.tiltAngle = 0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
	        }
	    };
	    /**
	     * window listener for resize events
	     */
	    Intermediate_MonsterHeadShading.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this._view.y = 0;
	        this._view.x = 0;
	        this._view.width = window.innerWidth;
	        this._view.height = window.innerHeight;
	    };
	    return Intermediate_MonsterHeadShading;
	}());
	window.onload = function () {
	    new Intermediate_MonsterHeadShading();
	};


/***/ }
]);
//# sourceMappingURL=Intermediate_MonsterHeadShading.js.map