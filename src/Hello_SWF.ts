import { DefaultRenderer, IEntity } from "awayjs-full/lib/renderer";
import { View, SceneGraphPartition, IEntityNodeClass } from "awayjs-full/lib/view";
import { PerspectiveProjection, CoordinateSystem, Loader, LoaderEvent, URLRequest, RequestAnimationFrame, AssetEvent, IAsset} from "awayjs-full/lib/core";
import { LoaderContainer, DisplayObject, MovieClip } from "awayjs-full/lib/scene";
import { AWDParser, SWFParser } from "awayjs-full/lib/parsers";
import { AS2SceneGraphFactory } from "awayjs-full/lib/player";
import {AVM1SceneGraphFactory, AVM1ContextImpl, LoaderInfo, } from "MathWhizzLessonManager";
import { SecurityDomain } from "MathWhizzLessonManager";
import { AVMAwayStage } from "MathWhizzLessonManager";
import { AVM1Globals } from "MathWhizzLessonManager";

class Hello_SWF
{
    private _fps:number = 30;
    private _rootTimeline:MovieClip;
    private stage_height = 400;
    private stage_width = 550;
    private _avm1SceneGraphFactory:AVM1SceneGraphFactory;
    private _stage:AVMAwayStage;

    constructor()
    {
        // create the AwayStage for AVM1
        this._stage = new AVMAwayStage(window.innerWidth / 2, window.innerHeight / 2, 0xFF0000, 24, null);
        // create the AVM1Context and the AVM1Scenegraphfactory
		this._avm1SceneGraphFactory = new AVM1SceneGraphFactory(new AVM1ContextImpl(new LoaderInfo()));
		this._avm1SceneGraphFactory.avm1Context.sec = new SecurityDomain();
		this._avm1SceneGraphFactory.avm1Context.setStage(this._stage, document);
		AVM1Globals._scenegraphFactory=this._avm1SceneGraphFactory;


        //create Loader container and load awd file
        var loader:LoaderContainer = new LoaderContainer();
        loader.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onLoadComplete(event));
        loader.addEventListener(AssetEvent.ASSET_COMPLETE, (event:AssetEvent) => this.onAssetComplete(event));
        loader.load(new URLRequest("assets/basic_tests/shapes_01_simple.swf"), null, null, new SWFParser(this._avm1SceneGraphFactory));

        //set resize listener
        window.onresize = (event) => this.onResize(event);
        this.onResize();
    }

	private onAssetComplete(event: AssetEvent): void {
		var asset: IAsset = event.asset;
		//this._lessonAssets[this._lessonAssets.length]=asset;
		if (asset.isAsset(MovieClip)) {
			if (asset.name == "scene") {
				this._stage.getLayer(0).addChild(<MovieClip>asset);
			}
		}
	}

    public onLoadComplete(event:LoaderEvent):void
    {
        this._rootTimeline = <MovieClip> event.assets[event.assets.length - 1]
        
        
    }
q

    private onResize(event = null)
    {
        this._stage.updateSize(0,0,window.innerWidth, window.innerHeight);
    }
}

window.onload = function() {
    new Hello_SWF();
}