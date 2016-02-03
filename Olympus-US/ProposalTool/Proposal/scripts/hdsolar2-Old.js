// hdsolar2.js
"use strict"
var HdSolar;
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
(function (HdSolar) {
    var BaseAnchor = (function () {
        function BaseAnchor(config) {
            this.config = config;
            this.parent = config.parent;
            this.__init();
        }
        BaseAnchor.prototype.getGroup = function () {
            return this.parent.getGroup();
        };
        BaseAnchor.prototype.name = function () {
            return this.anchor.name();
        };
        BaseAnchor.prototype.x = function (x) {
            if (x == undefined)
                return this.anchor.x();
            else
                this.anchor.x(x);
        };
        BaseAnchor.prototype.y = function (y) {
            if (y == undefined)
                return this.anchor.y();
            else
                this.anchor.y(y);
        };
        BaseAnchor.prototype.getPosition = function () {
            return this.anchor.getPosition();
        };
        BaseAnchor.prototype.setPosition = function (pos) {
            this.anchor.setPosition(pos);
        };
        BaseAnchor.prototype.show = function () {
            this.anchor.show();
        };
        BaseAnchor.prototype.hide = function () {
            this.anchor.hide();
        };
        BaseAnchor.prototype.drawGraphics = function (group) { };
        BaseAnchor.prototype.onHover = function (isHoverIn) { };
        BaseAnchor.prototype.__init = function () {
            var me = this;
            var cfg = {
                x: this.config.position.x,
                y: this.config.position.y,
                name: this.config.name,
                draggable: true,
                dragOnTop: true
            };
            if (this.config.dragBoundFunc != null)
                cfg.dragBoundFunc = this.config.dragBoundFunc;
            if (this.config.dummy) {
                cfg.draggable = false;
                cfg.visible = false;
            }
            this.anchor = new Kinetic.Group(cfg);
            this.drawGraphics(this.anchor);
            this.anchor.on('mousedown touchstart', function () {
                me.parent.getNode().setDraggable(false);
                me.onHover(true);
                this.moveToTop();
            });
            this.anchor.on('mouseover', function () {
                var layer = this.getLayer();
                document.body.style.cursor = 'pointer';
                me.onHover(true);
                layer.draw();
            });
            this.anchor.on('mouseout', function () {
                var layer = this.getLayer();
                document.body.style.cursor = 'default';
                me.onHover(false);
                layer.draw();
            });
            this.anchor.on('dragend', function () {
                me.parent.getNode().setDraggable(true);
                document.body.style.cursor = 'default';
                if (me.config.positionCallbackFunc != null) {
                    var p = me.config.positionCallbackFunc();
                    (new Kinetic.Tween({
                        node: me.anchor,
                        duration: 0.3,
                        x: p.x,
                        y: p.y
                    })).play();
                }
            });
            this.parent.getGroup().add(this.anchor);
        };
        return BaseAnchor;
    })();
    HdSolar.BaseAnchor = BaseAnchor;
    var Anchor = (function (_super) {
        __extends(Anchor, _super);
        function Anchor(config) {
            if (config.fill == null)
                config.fill = 'white';
            if (config.dummy == null)
                config.dummy = false;
            _super.call(this, config);
            this.init();
        }
        Anchor.prototype.update = function () {
            this.parent.update(this);
        };
        Anchor.prototype.drawGraphics = function (group) {
            var cfg = {
                stroke: 'black',
                fill: this.config.fill,
                strokeWidth: 1,
                radius: 5
            };
            this.circle = new Kinetic.Circle(cfg);
            this.anchor.add(this.circle);
        };
        Anchor.prototype.onHover = function (isHoverIn) {
            this.circle.setStrokeWidth(isHoverIn ? 2 : 1);
            this.circle.setStroke(isHoverIn ? 'red' : 'black');
        };
        Anchor.prototype.init = function () {
            var me = this;
            this.anchor.on('dragmove', function () {
                var layer = this.getLayer();
                me.update();
                layer.draw();
            });
            this.anchor.on('mousedown touchstart', function () {
                me.parent.getGroup().setDraggable(false);
                this.moveToTop();
            });
        };
        return Anchor;
    })(BaseAnchor);
    HdSolar.Anchor = Anchor;
})(HdSolar || (HdSolar = {}));
(function (HdSolar) {
    var RotateWheel = (function () {
        function RotateWheel(layer, position) {
            this.anchorRadius = 6;
            this.outerRadius = 35;
            this.group = null;
            this.controlGroup = null;
            this.onValueChanging = function (value) {
            };
            this.onValueChanged = function (value) {
            };
            var m = this;
            var stage = layer.getStage();
            this.group = new Kinetic.Group(position);
            layer.add(this.group);
            var circleConfig = {
                x: this.group.getOffset().x, y: this.group.getOffset().y, fill: 'green', opacity: 0.5, radius: 10,
            };
            var center = new Kinetic.Circle(circleConfig);
            this.group.add(center);
            var oc2Config = {
                x: circleConfig.x, y: circleConfig.y,
                fill: 'black', radius: this.outerRadius,
                fillPriority: 'radial-gradient',
                fillRadialGradientStartRadius: 0,
                fillRadialGradientEndRadius: this.outerRadius,
                fillRadialGradientColorStops: [0, '#D8D8D8', 0.5, '#707070', 0.95, '#C8C8C8', 1, 'grey'],
            };
            var o2circle = new Kinetic.Circle(oc2Config);
            this.group.add(o2circle);
            if (false) {
                var ocConfig = {
                    x: circleConfig.x, y: circleConfig.y, stroke: 'red',
                    fill: 'white',
                    opacity: 0.9, radius: this.outerRadius - 2 * this.anchorRadius,
                    fillPriority: 'radial-gradient',
                    fillRadialGradientStartRadius: 0,
                    fillRadialGradientEndRadius: this.outerRadius - 2 * this.anchorRadius,
                    fillRadialGradientColorStops: [0, 'brown', 0.4, 'white', 0.7, 'grey', 1, 'black'],
                };
                var ocircle = new Kinetic.Circle(ocConfig);
                this.group.add(ocircle);
            }
            var l1 = new Kinetic.Line({
                stroke: 'black', strokeWidth: 2, listening: false,
                points: [circleConfig.x - 9, circleConfig.y, circleConfig.x + 9, circleConfig.y]
            });
            this.group.add(l1);
            var l2 = new Kinetic.Line({
                stroke: 'black', strokeWidth: 2, listening: false,
                points: [circleConfig.x, circleConfig.y - 9, circleConfig.x, circleConfig.y + 9]
            });
            this.group.add(l2);
            var text = new Kinetic.Text({
                fill: 'blue', text: 'N', scale: { x: 1, y: 1 }
            });
            text.on('mouseover', function () {
                document.body.style.cursor = 'pointer';
                this.fill('#66CCFF');
                layer.draw();
            });
            text.on('mouseout', function () {
                document.body.style.cursor = 'default';
                this.fill('blue');
                layer.draw();
            });
            text.on('click', function () {
                var t = setInterval(function () {
                    var r = m.group.getRotationDeg();
                    if (r > 0) {
                        r -= 5;
                        if (r < 0)
                            r = 0;
                    }
                    else if (r < 0) {
                        r += 5;
                        if (r > 0)
                            r = 0;
                    }
                    m.setRotationDeg(r);
                    layer.draw();
                    if (r == 0) {
                        clearInterval(t);
                    }
                }, 16);
            });
            this.group.add(text);
            var tx = text.getWidth();
            text.setPosition({ x: -tx / 2, y: -20 });
            var controlGroupConfig = {
                x: this.group.getPosition().x + this.outerRadius - this.anchorRadius,
                y: this.group.getPosition().y,
                opacity: 1, draggable: true,
            };
            controlGroupConfig.dragBoundFunc = function (pos) {
                var groupPos = m.group.getPosition();
                var rotation = HdSolar.Utils.degrees(HdSolar.Utils.angle(groupPos.x, groupPos.y, pos.x, pos.y));
                var dis = HdSolar.Utils.distance(groupPos.x, groupPos.y, pos.x, pos.y);
                m.group.setRotationDeg(rotation);
                layer.draw();
                return pos;
            };
            this.controlGroup = new Kinetic.Group(controlGroupConfig);
            layer.add(this.controlGroup);
            var rotator = new Kinetic.Circle({
                x: 0, y: 0,
                fill: 'red',
                opacity: 1,
                radius: this.anchorRadius,
                stroke: 'black',
                strokeWidth: 0.5,
                fillPriority: 'radial-gradient',
                fillRadialGradientStartRadius: 0,
                fillRadialGradientEndRadius: this.anchorRadius,
                fillRadialGradientColorStops: [0, 'white', 0.7, '#707070', 1, 'grey']
            });
            this.controlGroup.add(rotator);
            rotator.on('mouseover', function () {
                document.body.style.cursor = 'pointer';
                this.setStrokeWidth(1);
                this.getLayer().draw();
            });
            rotator.on('mouseout', function () {
                document.body.style.cursor = 'default';
                this.strokeWidth(0.5);
                this.getLayer().draw();
            });
            this.controlGroup.on('dragend', function () {
                var radius = m.outerRadius - m.anchorRadius, angle = HdSolar.Utils.radians(m.group.getRotation()), groupPos = m.group.getPosition();
                var tween = new Kinetic.Tween({
                    node: m.controlGroup,
                    duration: 0.3,
                    x: groupPos.x + radius * Math.cos(angle),
                    y: groupPos.y + radius * Math.sin(angle),
                });
                tween.play();
                if (m.onValueChanged != undefined) {
                    m.onValueChanged(m.group.getRotationDeg());
                }
            });
            this.controlGroup.on("dragmove", function () {
                if (m.onValueChanging != undefined) {
                    m.onValueChanging(m.group.getRotationDeg());
                }
            });
            layer.draw();
        }
        RotateWheel.prototype.setRotationDeg = function (r) {
            this.group.setRotationDeg(r);
            var radius = this.outerRadius - this.anchorRadius, angle = HdSolar.Utils.radians(this.group.getRotation()), groupPos = this.group.getPosition();
            this.controlGroup.setPosition({
                x: groupPos.x + radius * Math.cos(angle),
                y: groupPos.y + radius * Math.sin(angle),
            });
            this.onValueChanging(r);
            this.onValueChanged(r);
        };
        return RotateWheel;
    })();
    HdSolar.RotateWheel = RotateWheel;
    var PanelStock = (function () {
        function PanelStock(layer, position) {
            this.panelInfo = { width: 28, height: 17 };
            this.onAddPanelShape = function (position) {
            };
            this.layer = layer;
            var m = this;
            var stage = layer.getStage();
            this.group = new Kinetic.Group({
                x: position.x,
                y: position.y,
                draggable: false
            });
            this.layer.add(this.group);
            this.boundRect = new Kinetic.Rect({
                stroke: 'red',
                width: this.panelInfo.width * 2,
                height: this.panelInfo.height * 2,
            });
            this.boundRect.on("mouseover", function () {
                var r = this;
                r.setStrokeWidth(2);
                m.layer.draw();
            });
            this.boundRect.on("mouseout", function () {
                var r = this;
                r.setStrokeWidth(1);
                m.layer.draw();
            });
            this.group.add(this.boundRect);
            this.dragGroup = new Kinetic.Group({
                x: this.boundRect.x(),
                y: this.boundRect.y(),
                width: this.boundRect.width(),
                height: this.boundRect.height(),
                draggable: true
            });
            this.dragRect = new Kinetic.Rect({
                x: 0,
                y: 0,
                stroke: 'red',
                width: this.boundRect.width(),
                height: this.boundRect.height(),
                opacity: 0.5,
                draggable: false
            });
            this.group.on("mouseover", function () {
                var r = m.boundRect;
                document.body.style.cursor = 'pointer';
                r.setStrokeWidth(3);
                m.layer.draw();
            });
            this.group.on("mouseout", function () {
                var r = m.boundRect;
                document.body.style.cursor = 'default';
                r.setStrokeWidth(1);
                m.layer.draw();
            });
            this.dragGroup.on("dragend", function (evtarg) {
                m.dropOnMap(evtarg.evt);
            });
            this.dragGroup.add(this.dragRect);
            this.group.add(this.dragGroup);
            this.drawPanels();
            this.layer.draw();
        }
        PanelStock.prototype.createDragRect = function () {
            if (this.dragRect != null) {
                this.dragRect.destroy();
            }
            this.dragRect = new Kinetic.Rect({
                x: 0,
                y: 0,
                stroke: 'blue',
                fill: 'violet',
                width: this.boundRect.width(),
                height: this.boundRect.height(),
                opacity: 1,
                draggable: true
            });
            this.group.add(this.dragRect);
            this.layer.draw();
        };
        PanelStock.prototype.dropOnMap = function (evtarg) {
            var pos = {
                x: evtarg.layerX,
                y: evtarg.layerY
            };
            var apos = this.dragGroup.getAbsolutePosition();
            this.dragGroup.setPosition({ x: 0, y: 0 });
            this.layer.draw();
            this.onAddPanelShape(apos);
        };
        PanelStock.prototype.drawPanels = function () {
            var pi = this.panelInfo;
            var groupSize = this.dragGroup.getSize();
            var col = Math.round(groupSize.width / pi.width);
            var row = Math.round(groupSize.height / pi.height);
            var panelImages = [];
            var loadedImages = 0;
            var numImages = row * col;
            var that = this;
            for (var r = 0; r < numImages; r++) {
                panelImages[r] = new Image();
                panelImages[r].onload = function () {
                    if (++loadedImages >= numImages) {
                        that.panelImageLoaded(panelImages, row, col);
                    }
                };
                panelImages[r].src = 'images/panel.png';
            }
        };
        PanelStock.prototype.panelImageLoaded = function (panelImages, row, col) {
            var pi = this.panelInfo;
            for (var r = 0; r < row; r++) {
                for (var c = 0; c < col; c++) {
                    var kimg = new Kinetic.Image({
                        x: pi.width * c,
                        y: pi.height * r,
                        image: panelImages[r * col + c],
                        width: pi.width,
                        height: pi.height,
                        opacity: 1,
                        name: 'panel'
                    });
                    this.dragGroup.add(kimg);
                }
            }
            this.layer.draw();
        };
        return PanelStock;
    })();
    HdSolar.PanelStock = PanelStock;
    var ZoomRect = (function () {
        function ZoomRect(group, position, isZoomIn, width) {
            this.e = true;
            this.p = true;
            this.ls = new Array();
            this.onClick = function (evt) { };
            this.group = group;
            var m = this;
            var bound = {
                x: position.x,
                y: position.y,
                width: width,
                height: width,
            };
            this.p = isZoomIn;
            var rcfg = bound;
            var r = new Kinetic.Rect({
                x: position.x,
                y: position.y,
                fill: '#999999',
                stroke: 'gray',
                strokeWidth: 1,
                width: width,
                height: width,
            });
            var off = 6;
            var y = position.y + width / 2;
            var x1 = position.x + off, x2 = position.x + width - off;
            var l1 = new Kinetic.Line({ stroke: 'blue', strokeWidth: 3, listening: false, points: [x1, y, x2, y] });
            this.ls.push(l1);
            if (this.p) {
                var x = position.x + width / 2;
                var y1 = position.y + off, y2 = position.y + width - off;
                var l2 = new Kinetic.Line({ stroke: 'blue', strokeWidth: 3, listening: false, points: [x, y1, x, y2] });
                this.ls.push(l2);
            }
            r.on("mouseover", function () { if (m.e)
                m.onMouseOver(r); });
            r.on("mouseout", function () { m.onMouseOut(r); });
            r.on("click", function (data) { if (m.e)
                m.onClick(data); });
            r.on("mousedown", function () {
                if (m.e) {
                    r.setFill('#3CB371');
                    m.group.getLayer().draw();
                }
            });
            r.on("mouseup", function () {
                if (m.e) {
                    r.setFill('white');
                    m.group.getLayer().draw();
                }
            });
            group.add(r);
            this.ls.forEach(function (v) { group.add(v); });
        }
        ZoomRect.prototype.onMouseOver = function (r) {
            document.body.style.cursor = 'pointer';
            r.setStrokeWidth(2);
            r.setFill('white');
            this.ls.forEach(function (v) { v.setStrokeWidth(3.5); });
            this.group.getLayer().draw();
        };
        ZoomRect.prototype.onMouseOut = function (r) {
            document.body.style.cursor = 'default';
            r.setStrokeWidth(1);
            r.setFill('#999999');
            this.ls.forEach(function (v) { v.setStrokeWidth(3); });
            this.group.getLayer().draw();
        };
        ZoomRect.prototype.enable = function (en) {
            this.e = en;
        };
        return ZoomRect;
    })();
    var ZoomControl = (function () {
        function ZoomControl(layer, position) {
            this.width = 25;
            this.height = this.width * 2;
            this.cp = null;
            this.cm = null;
            this.onZoomIn = function () { };
            this.onZoomOut = function () { };
            this.layer = layer;
            var that = this;
            var stage = layer.getStage();
            this.group = new Kinetic.Group({
                x: position.x,
                y: position.y,
                draggable: false
            });
            this.layer.add(this.group);
            this.cp = new ZoomRect(this.group, { x: 0, y: 0 }, true, this.width);
            this.cm = new ZoomRect(this.group, { x: 0, y: this.width }, false, this.width);
            this.cp.onClick = function (data) { that.onZoomIn(); that.enableZoomOut(true); };
            this.cm.onClick = function (data) { that.onZoomOut(); that.enableZoomIn(true); };
            this.layer.draw();
        }
        ZoomControl.prototype.enableZoomIn = function (en) {
            this.cp.enable(en);
        };
        ZoomControl.prototype.enableZoomOut = function (en) {
            this.cm.enable(en);
        };
        return ZoomControl;
    })();
    HdSolar.ZoomControl = ZoomControl;
})(HdSolar || (HdSolar = {}));
(function (HdSolar) {
    ;
    var Utils = (function () {
        function Utils() {
        }
        Utils.radians = function (degrees) { return degrees * (Math.PI / 180); };
        Utils.degrees = function (radians) { return radians * (180 / Math.PI); };
        Utils.angle = function (cx, cy, px, py) { var x = cx - px; var y = cy - py; return Math.atan2(-y, -x); };
        Utils.distance = function (p1x, p1y, p2x, p2y) { return Math.sqrt(Math.pow((p2x - p1x), 2) + Math.pow((p2y - p1y), 2)); };
        Utils.bound = function (value, opt_min, opt_max) {
            if (opt_min != null)
                value = Math.max(value, opt_min);
            if (opt_max != null)
                value = Math.min(value, opt_max);
            return value;
        };
        return Utils;
    })();
    HdSolar.Utils = Utils;
    (function (MapType) {
        MapType[MapType["Google"] = 1] = "Google";
        MapType[MapType["Nearmap"] = 2] = "Nearmap";
    })(HdSolar.MapType || (HdSolar.MapType = {}));
    var MapType = HdSolar.MapType;
    var MercatorProjection = (function () {
        function MercatorProjection(TILE_SIZE) {
            this.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2, TILE_SIZE / 2);
            this.pixelsPerLonDegree_ = TILE_SIZE / 360;
            this.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
        }
        MercatorProjection.prototype.fromLatLngToPoint = function (latLng, opt_point) {
            var point = opt_point || new google.maps.Point(0, 0);
            var origin = this.pixelOrigin_;
            point.x = origin.x + latLng.lng() * this.pixelsPerLonDegree_;
            var siny = Utils.bound(Math.sin(Utils.radians(latLng.lat())), -0.9999, 0.9999);
            point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) *
                -this.pixelsPerLonRadian_;
            return point;
        };
        MercatorProjection.prototype.fromPointToLatLng = function (point) {
            var me = this;
            var origin = me.pixelOrigin_;
            var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
            var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
            var lat = Utils.degrees(2 * Math.atan(Math.exp(latRadians)) -
                Math.PI / 2);
            return new google.maps.LatLng(lat, lng);
        };
        return MercatorProjection;
    })();
    var MapView = (function () {
        function MapView(config) {
            this._ZL = { min: 18, max: 23 };
            this._z = 21;
            this._spid = 1;
            this._pss = new Array();
            this._cpi = { width: 1.65, height: 1, vgap: 0.0, hgap: 0.0 };
            this._isprt = false;
            this._ma = 100;
            this._mt = MapType.Google;
            this._azoff = 90;
            var me = this;
            this._cf = config;
            this._lat = config.lat;
            this._lng = config.lng;
            this._z = config.zoom;
            this._mt = this._cf.mapType;
            if (config.maxArray != null)
                this._ma = config.maxArray;
            var jqp = '#' + config.container;
            var width = $(jqp).width();
            var height = $(jqp).height();
            var stage = new Kinetic.Stage({
                container: config.container,
                width: width,
                height: height
            });
            $(window).resize(function () {
                stage.width($(jqp).width());
                stage.height($(jqp).height());
            });
            this._bil = this._bilGoogle;
            this._ZL = { min: 18, max: 21 };
            var pos = { x: 0, y: 0 }, mrot = 0;
            if (config.worksData != null) {
                pos = config.worksData.olpos;
                mrot = config.worksData.mrot;
            }
            var olGrCfg = {
                draggable: true,
                position: pos,
                dragBoundFunc: function (p) {
                    var tpx = stage.getWidth() / 2, tpy = stage.getHeight() / 2;
                    var f = 256;
                    var minX = -f + tpx, maxX = f + tpx, minY = -f + tpy, maxY = f + tpy;
                    var nx = p.x;
                    var ny = p.y;
                    if (nx < minX) {
                        nx = minX;
                    }
                    else if (nx > maxX) {
                        nx = maxX;
                    }
                    if (ny < minY) {
                        ny = minY;
                    }
                    else if (ny > maxY) {
                        ny = maxY;
                    }
                    return ({ x: nx, y: ny });
                }
            };
            this._olGroup = new Kinetic.Group(olGrCfg);
            this._olGroup.on('dragstart', function () { document.body.style.cursor = 'move'; });
            this._olGroup.on('dragend', function () { document.body.style.cursor = 'default'; });
            this._mapGroup = new Kinetic.Group();
            this._olGroup.add(this._mapGroup);
            this._mapLayer = new Kinetic.Layer({ x: width / 2, y: height / 2, rotationDeg: mrot });
            this._mapLayer.add(this._olGroup);
            stage.add(this._mapLayer);
            stage.draw();
            this._ctlLayer = new Kinetic.Layer();
            stage.add(this._ctlLayer);
            var wh = new HdSolar.RotateWheel(this._ctlLayer, { x: 70, y: 70 });
            wh.onValueChanging = function (rotation) {
                me._mapLayer.setRotationDeg(rotation);
                me._mapLayer.draw();
            };
            wh.setRotationDeg(mrot);
            wh.onValueChanged = function (rotation) {
                me._mapLayer.setRotationDeg(rotation);
                me._pss.forEach(function (v) { v.update2(); });
                me._mapLayer.draw();
            };
            var pstock = new HdSolar.PanelStock(this._ctlLayer, { x: 43, y: 130 });
            pstock.onAddPanelShape = function (pos) {
                if (me._pss.length >= me._ma)
                    return;
                var mpos = me._mapLayer.getPosition();
                var rpos = {
                    x: pos.x - mpos.x,
                    y: pos.y - mpos.y
                };
                me._ads(pos);
            };
            var zoomCtl = new HdSolar.ZoomControl(this._ctlLayer, { x: 60, y: 200 });
            zoomCtl.onZoomIn = function () {
                if (me._z < me._ZL.max) {
                    me._setMapTiles(me._bil(me._lat, me._lng, ++me._z));
                    me._pss.forEach(function (v) { v.changeZoom(true); });
                    if (me._z == me._ZL.max)
                        zoomCtl.enableZoomIn(false);
                }
            };
            zoomCtl.onZoomOut = function () {
                if (me._z > me._ZL.min) {
                    me._setMapTiles(me._bil(me._lat, me._lng, --me._z));
                    me._pss.forEach(function (v) { v.changeZoom(false); });
                    if (me._z == me._ZL.min)
                        zoomCtl.enableZoomOut(false);
                }
            };
            this._setMapTiles(this._bil(this._lat, this._lng, this._z));
        }
        MapView.prototype.setCurrPanelInfo = function (panelInfo) {
            this._cpi = panelInfo;
        };
        MapView.prototype._bilGoogle = function (lat, lng, zoom) {
            var mapBase = "/maps/api/staticmap?";
            this._ZL.max = 21;
            var sc = 2;
            var psize = 640 * sc;
            var z = (sc == 2) ? zoom - 1 : zoom;
            var url = mapBase + "center=" + lat + "," + lng + "&zoom=" + z + "&size=" + psize + "x" + psize + "&scale=" + sc + "&maptype=satellite";
            return [{ image: null, x: -(psize / 2), y: -(psize / 2), url: url }];
        };
        MapView.prototype._setCfgHdlr = function (c) {
            var m = this;
            c.syncOrientation = this._cf.syncOrientation;
            c.onchange = function (o) {
                if (m._cf.onPanelInfoChanged != null)
                    m._cf.onPanelInfoChanged();
                if (m._hpc != null)
                    m._hpc(o.getId());
            };
            c.onrotate = function (o, deg) {
                if (m._hpc != null)
                    m._hpc(o.getId());
            };
            c.ondestroy = function (ob) {
                var j = m._pss.indexOf(ob);
                var bsl = ob.isSelected();
                if (j >= 0)
                    m._pss.splice(j, 1);
                if (m._hpd != null)
                    m._hpd(ob.getId());
                if (bsl && m._pss.length > 0) {
                    if (j >= m._pss.length)
                        j = m._pss.length - 1;
                    m._onclk(m._pss[j]);
                }
            };
            c.onclicked = function (s) { m._onclk(s); };
        };
        MapView.prototype.getPanelShapeCount = function () {
            return this._pss.length;
        };
        MapView.prototype.getPanelShapeInfo = function () {
            var arr = [];
            this._pss.forEach(function (o) {
                arr.push(o.getInfo());
            });
            return arr;
        };
        MapView.prototype.getPanelShapeInfoById = function (id) {
            if (id == null)
                throw "Please provide id";
            for (var i = 0; i < this._pss.length; i++) {
                var tid = this._pss[i].getId();
                if (id == tid)
                    return this._pss[i].getInfo();
            }
            return null;
        };
        MapView.prototype.getPanelCount = function () {
            var pc = 0;
            for (var i = 0; i < this._pss.length; i++) {
                pc += this._pss[i].getPanelCount();
            }
            return pc;
        };
        MapView.prototype.clearPanels = function () {
            while (this._pss.length > 0)
                this._pss[0].destroy();
        };
        MapView.prototype.onPanelShapeSelected = function (handler) {
            this._hps = handler;
        };
        MapView.prototype.onPanelShapeAdded = function (handler) {
            this._hpa = handler;
        };
        MapView.prototype.onPanelShapeDeleted = function (handler) {
            this._hpd = handler;
        };
        MapView.prototype.onPanelShapeChanged = function (handler) {
            this._hpc = handler;
        };
        MapView.prototype._findShape = function (id) {
            for (var i = 0; i < this._pss.length; i++)
                if (this._pss[i].getId() == id)
                    return this._pss[i];
        };
        MapView.prototype.setPanelShapePanelSlope = function (id, slope, infoOnly) {
            var s = this._findShape(id);
            if (s != null)
                s.setPanelSlope(slope, infoOnly);
        };
        MapView.prototype.setPanelShapePortrait = function (id, isPortrait) {
            var s = this._findShape(id);
            if (s != null)
                s.setPanelPortrait(isPortrait);
        };
        MapView.prototype.setPanelShapePanelType = function (id, panelType) {
            var s = this._findShape(id);
            if (s != null) {
                var f = MapView._TSZ / MapView.getLengthOfTile(this._z);
                var pi = {
                    width: f * panelType.width,
                    height: f * panelType.height,
                    hgap: f * panelType.hgap,
                    vgap: f * panelType.vgap
                };
                s.setPanelInfo(pi);
            }
        };
        MapView.prototype.setPanelShapeArea = function (id, area) {
            var s = this._findShape(id);
            if (s != null)
                s.setPanelShapeArea(area);
        };
        MapView.prototype.setPanelShapeRotation = function (id, degree) {
            var s = this._findShape(id);
            if (s != null)
                s.setRotationDeg(Number(degree));
        };
        MapView.prototype.setPanelShapeShading = function (id, shading) {
            var s = this._findShape(id);
            if (s != null)
                s.setPanelShapeShading(shading);
        };
        MapView.prototype.setPanelShapeMountType = function (id, mountType) {
            var s = this._findShape(id);
            if (s != null)
                s.setPanelMountType(mountType);
        };
        MapView.prototype.setPanelShapeSelected = function (id) {
            this._pss.forEach(function (v) {
                v.setSelected((v.getId() == id));
            });
        };
        MapView.prototype.setPanelPortrait = function (isprt) {
            this._isprt = isprt;
            for (var i = 0; i < this._pss.length; i++)
                this._pss[i].setPanelPortrait(isprt);
        };
        MapView.prototype.showControls = function (s) {
            this._pss.forEach(function (v) {
                if (v.isSelected() || !s) {
                    v.showControls(s);
                }
            });
        };
        MapView.prototype.exportMap = function () {
            this.showControls(false);
            var d = this._mapLayer.toDataURL(null);
            this.showControls(true);
            return d;
        };
        MapView.prototype.getState = function () {
            var data = {
                lat: this._lat,
                lng: this._lng,
                zoom: this._z,
                panelShapes: [],
                olpos: this._olGroup.getPosition(),
                mrot: this._mapLayer.getRotationDeg()
            };
            for (var i = 0; i < this._pss.length; i++) {
                var psexp = this._pss[i].getState();
                data.panelShapes.push(psexp);
            }
            return data;
        };
        MapView.prototype.setState = function (data) {
            var pss = data.panelShapes;
            var m = this;
            pss.forEach(function (p) {
                var c = {
                    width: p.width,
                    height: p.height,
                    parent: m._olGroup,
                    panelInfo: p.panelInfo,
                    draggable: true,
                    spid: m._spid++,
                    name: 'panelShape',
                    ctlLayer: m._ctlLayer,
                    rotation: p.rotation,
                    emptyMap: p.emptyMap,
                    azimuth: p.azimuth,
                    pslope: p.pslope,
                    pslopeprt: p.pslopeprt
                };
                m._setCfgHdlr(c);
                var srect = new Rectangle(c);
                srect.setPosition({ x: p.x, y: p.y });
                m._pss.push(srect);
                if (m._hpa != null)
                    m._hpa(srect.getId());
                m._onclk(srect);
                if (m._cf.onPanelInfoChanged != null)
                    m._cf.onPanelInfoChanged();
            });
            this._mapLayer.draw();
        };
        MapView.prototype._ads = function (pos) {
            var m = this;
            var f = MapView._TSZ / MapView.getLengthOfTile(this._z);
            var pi = {
                width: f * this._cpi.width,
                height: f * this._cpi.height,
                vgap: f * this._cpi.vgap,
                hgap: f * this._cpi.hgap
            };
            var c = {
                x: 0,
                y: 0,
                width: pi.width * 2,
                height: pi.height * 2,
                draggable: true,
                panelInfo: pi,
                spid: m._spid++,
                name: 'panelShape',
                ctlLayer: this._ctlLayer,
                parent: this._olGroup,
                azimuth: this._mt == (HdSolar.MapType.Google) ? 180 : 0,
                pslope: 20,
                pslopeprt: this._isprt
            };
            this._setCfgHdlr(c);
            var srect = new Rectangle(c);
            if (pos != undefined)
                srect.setAbsolutePosition(pos);
            var rtn = this._mapLayer.getRotationDeg();
            srect.setRotationDeg(-rtn);
            this._pss.push(srect);
            this._mapLayer.draw();
            if (this._hpa != null)
                this._hpa(srect.getId());
            this._onclk(srect);
            if (this._cf.onPanelInfoChanged != null)
                this._cf.onPanelInfoChanged();
        };
        MapView.prototype._onclk = function (s) {
            if (s.isSelected())
                return;
            this._pss.forEach(function (v) {
                v.setSelected((s == v));
            });
            if (this._hps != null)
                this._hps(s.getId());
        };
        MapView.getLengthOfTile = function (zoom) {
            var latlng = new google.maps.LatLng(-32.050443, 115.763436);
            var numTiles = 1 << zoom;
            var projection = new MercatorProjection(MapView._TSZ);
            var worldCoordinate = projection.fromLatLngToPoint(latlng);
            var pixelCoordinate = new google.maps.Point(worldCoordinate.x * numTiles, worldCoordinate.y * numTiles);
            pixelCoordinate.x -= MapView._TSZ;
            worldCoordinate = new google.maps.Point(pixelCoordinate.x / numTiles, pixelCoordinate.y / numTiles);
            var nlatlng = projection.fromPointToLatLng(worldCoordinate);
            var tsz = google.maps.geometry.spherical.computeDistanceBetween(latlng, nlatlng);
            return tsz;
        };
        MapView.prototype._setMapTiles = function (images) {
            this._mapGroup.destroyChildren();
            var m = this;
            for (var i in images) {
                images[i].image = new Image();
                images[i].image.id = i;
                images[i].image.onload = function () {
                    m._addMapTile(images[this.id]);
                };
                images[i].image.src = images[i].url;
            }
        };
        MapView.prototype._addMapTile = function (tileInfo) {
            var gmImg = new Kinetic.Image({
                x: tileInfo.x,
                y: tileInfo.y,
                image: tileInfo.image,
                opacity: 0
            });
            this._mapGroup.add(gmImg);
            var tween = new Kinetic.Tween({
                node: gmImg,
                duration: 0.6,
                opacity: 1,
                easing: Kinetic.Easings.EaseInOut
            });
            tween.play();
        };
        MapView._TSZ = 256;
        return MapView;
    })();
    HdSolar.MapView = MapView;
    ;
    var SolarPanel = (function () {
        function SolarPanel(config) {
            this.empty = false;
            this.visible = true;
            this.isprt = false;
            this.rawimg = null;
            this.kimg = null;
            this.kimgl = null;
            this.kimgp = null;
            this.dblclick_firstclick = false;
            this.bopq = false;
            this.config = config;
            this.pos = config.position;
            this.size = {
                width: config.width, height: config.height
            };
            this.isprt = config.isprt;
            this.loadImage();
        }
        SolarPanel.prototype.loadImage = function () {
            var imgloc = 'images/';
            var me = this;
            this.rawimg = new Image();
            this.rawimg.onload = function () { me.imageLoaded(); };
            this.rawimg.src = this.isprt ? SolarPanel.imgDatap : SolarPanel.imgDatal;
        };
        SolarPanel.prototype.isEmpty = function () { return this.empty; };
        SolarPanel.prototype.setVisible = function (show) {
            if (show == this.visible)
                return;
            this.visible = show;
            if (this.kimg != null) {
                show ? this.kimg.show() : this.kimg.hide();
            }
        };
        SolarPanel.prototype.setOpaque = function (bOpaque) {
            this.bopq = bOpaque;
            if (this.kimg != null)
                this.kimg.setOpacity(this.empty ? 0 : this.bopq ? 1 : 0.3);
        };
        SolarPanel.prototype.destroy = function () {
            this.kimg.destroy();
        };
        SolarPanel.prototype.setPortrait = function (isPortrait) {
            if (this.isprt == isPortrait)
                return;
            this.isprt = isPortrait;
            var w = this.config.width;
            var h = this.config.height;
            var m = Math.min(w, h);
            if (this.kimg != null)
                this.kimg.hide();
            this.kimg = this.isprt ? this.kimgp : this.kimgl;
            if (this.kimg == null) {
                this.loadImage();
            }
            else {
                if (this.visible)
                    this.kimg.show();
            }
        };
        SolarPanel.prototype.setBound = function (pos, size) {
            if (pos.x != this.pos.x) {
                this.pos.x = pos.x;
                if (this.kimg != null)
                    this.kimg.x(pos.x);
            }
            if (pos.y != this.pos.y) {
                this.pos.y = pos.y;
                if (this.kimg != null)
                    this.kimg.y(pos.y);
            }
            if (size.width != this.size.width) {
                this.size.width = size.width;
                if (this.kimg != null)
                    this.kimg.width(size.width);
            }
            if (size.height != this.size.height) {
                this.size.height = size.height;
                if (this.kimg != null)
                    this.kimg.height(size.height);
            }
        };
        SolarPanel.prototype.imageLoaded = function () {
            var me = this;
            var c = {
                x: this.pos.x,
                y: this.pos.y,
                image: this.rawimg,
                width: this.size.width,
                height: this.size.height,
                opacity: 0.3,
                name: 'panel',
                visible: this.visible
            };
            this.kimg = new Kinetic.Image(c);
            if (this.isprt) {
                this.kimgp = this.kimg;
            }
            else {
                this.kimgl = this.kimg;
            }
            var w = this.config.width;
            var h = this.config.height;
            var m = Math.min(w, h);
            this.kimg.on('mousedown', function () { me.onmousedown(); });
            this.kimg.on('mouseover', function () {
                if (me.empty || me.bopq)
                    return;
                this.stroke('red');
                this.strokeWidth(3);
                this.opacity(1);
                this.getLayer().draw();
            });
            this.kimg.on('mouseout', function () {
                if (me.empty || me.bopq)
                    return;
                this.stroke(null);
                this.strokeWidth(null);
                this.opacity(0.3);
                this.getLayer().draw();
            });
            this.config.parent.add(this.kimg);
            this.kimg.moveToBottom();
            if (SolarPanel.tmr != null)
                clearTimeout(SolarPanel.tmr);
            SolarPanel.tmr = setTimeout(function () {
                var l = me.config.parent.getLayer();
                l.draw();
            }, 50);
        };
        SolarPanel.prototype.onmousedown = function () {
            if (this.dblclick_firstclick) {
                this.empty = !this.empty;
                this.kimg.setOpacity(this.empty ? 0 : 1);
                if (this.config.onPanelCountChanged != null)
                    this.config.onPanelCountChanged();
            }
            this.dblclick_firstclick = true;
            var me = this;
            var vtimer = setTimeout(function () { me.dblclick_firstclick = false; }, 500);
        };
        SolarPanel.imgDatal = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAKCAYAAABSfLWiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAACCSURBVChTY/wPBAwUArAh8urNDMzMTAx//0LMy0nXZJgw9SoDOzszmA8C3779YSjM0Wbon3KVgYuLBSz29+8/hoc3axmYQByQASDMxMwIlgQBJqgYQg6ImRgxxMFqwSSFYNQQTAA2BBRVIPwPGsUg8A8qhpAD4n//McRBgAqJjYEBAHBoRQZ8lrP3AAAAAElFTkSuQmCCTkSuQmCC";
        SolarPanel.imgDatap = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAARCAYAAADkIz3lAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAACzSURBVChTY/wPBAxEALBCefVmBmZmJqgQKvj79x/ Dw5u1DGBZkCJ8GASwG4MFgBV++ / aH4SsODJIDARYQUZijzcDExAgWQAf//kH8CvaMhEIjAxPULejgH9AzLx7UQ6zm4mJh4MaBQXIgQJpniAFghT9//mX4gQOD5EAA7JnuvrVgDi5QWhQMi8IWqBB28PBmDcKNTMyMWDEMgBUyAwVYgOGIDYPk4ApBKQQfBgEi0yMDAwDn53XpOZZRZgAAAABJRU5ErkJggg==";
        SolarPanel.tmr = null;
        return SolarPanel;
    })();
    var BaseShape = (function () {
        function BaseShape(c) {
            this.azimuth_offset = 90;
            this.azimuth = 0;
            this.pslope = 20;
            this.pslopeInfoOly = false;
            this.pslopeprt = false;
            this.panelCount = 4;
            this.area = 0;
            this.shading = { yearlyshade: "97", janshade: "97", febshade: "97", marshade: "97", aprshade: "97", mayshade: "97", junshade: "97", julshade: "97", augshade: "97", sepshade: "97", octshade: "97", novshade: "97", decshade: "97" };
            this.mountType = 'slope';
            this.bselected = false;
            var me = this;
            this.config = c;
            this._spid = c.spid;
            this.pslope = this.config.pslope;
            this.pslopeprt = this.config.pslopeprt;
            this.azimuth = this.config.azimuth;
            this.kgroup = new Kinetic.Group({
                x: 0, y: 0,
                width: c.width,
                height: c.height,
                name: c.name,
                draggable: true
            });
            c.parent.add(this.kgroup);
            this.kgroup.on("click", function () {
                if (me.config.onclicked != null)
                    me.config.onclicked(me);
            });
        }
        BaseShape.prototype.getId = function () {
            return this._spid;
        };
        BaseShape.prototype.getNode = function () {
            return this.kgroup;
        };
        BaseShape.prototype.getGroup = function () {
            return this.kgroup;
        };
        BaseShape.prototype.getInfo = function () {
            return {
                id: this.getId(),
                panelCount: this.getPanelCount(),
                azimuth: this.getAzimuth(),
                rotation: this.getRotation(),
                area: this.area,
                shading: this.shading,
                slope: this.pslope,
                orientation: this.pslopeprt ? 'portrait' : 'landscape',
                mountType: this.mountType
            };
        };
        BaseShape.prototype.showControls = function (bshow) {
        };
        BaseShape.prototype.update = function (anchor) {
        };
        BaseShape.prototype.update2 = function () {
        };
        BaseShape.prototype.changeZoom = function (isZoomIn) {
        };
        BaseShape.prototype.setPosition = function (pos) {
            this.kgroup.setPosition(pos);
        };
        BaseShape.prototype.setAbsolutePosition = function (pos) {
            this.kgroup.setAbsolutePosition(pos);
        };
        BaseShape.prototype.getAbsolutePosition = function () {
            return this.kgroup.getAbsolutePosition();
        };
        BaseShape.prototype.getLayer = function () {
            return this.kgroup.getLayer();
        };
        BaseShape.prototype.getRotation = function () {
            var az = this.kgroup.getRotationDeg();
            if (az < 0)
                az = 360 + az;
            if (az >= 360)
                az = az - 360;
            return az;
        };
        BaseShape.prototype.setRotationDeg = function (rotation) {
            this.kgroup.setRotationDeg(rotation);
            this.getLayer().draw();
        };
        BaseShape.prototype.getPanelCount = function () {
            return this.panelCount;
        };
        BaseShape.prototype.getAzimuth = function (azr) {
            return 0;
        };
        BaseShape.prototype.getEmptyMap = function () {
            return null;
        };
        BaseShape.prototype.getState = function () {
            var p = this.kgroup.getPosition();
            var s = {
                x: p.x, y: p.y,
                pslope: this.pslope,
                pslopeprt: this.pslopeprt,
                panelInfo: this.config.panelInfo,
                width: this.kgroup.width(),
                height: this.kgroup.height(),
                rotation: this.kgroup.getRotationDeg(),
                azimuth: this.getAzimuth(),
                emptyMap: this.getEmptyMap()
            };
            return s;
        };
        BaseShape.prototype.setPanelSlope = function (deg, infoOnly) {
            if (deg >= 0 && deg < 90) {
                this.pslope = deg;
                this.pslopeInfoOly = infoOnly;
                this.update();
            }
        };
        BaseShape.prototype.setPanelPortrait = function (isprt) {
            this.pslopeprt = isprt;
        };
        BaseShape.prototype.setPanelInfo = function (pi) {
            this.config.panelInfo = pi;
            this.update();
        };
        BaseShape.prototype.setPanelShapeArea = function (area) {
            this.area = area;
        };
        BaseShape.prototype.setPanelShapeShading = function (shading) {
            this.shading = shading;
        };
        BaseShape.prototype.setPanelMountType = function (mountType) {
            this.mountType = mountType;
            if (mountType == 'flat')
                this.setPanelSlope(0, false);
        };
        BaseShape.prototype.destroy = function () {
            var l = this.getLayer();
            if (this.config.ondestroy != null)
                this.config.ondestroy(this);
            this.kgroup.destroyChildren();
            this.kgroup.destroy();
            l.draw();
        };
        BaseShape.prototype.setSelected = function (s) {
            this.bselected = s;
        };
        BaseShape.prototype.isSelected = function () {
            return this.bselected;
        };
        return BaseShape;
    })();
    ;
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle(c) {
            _super.call(this, c);
            this.row = 0;
            this.col = 0;
            this.bopq = false;
            this.solarPanels = new Array();
            this.init(c);
        }
        Rectangle.prototype.init = function (config) {
            var me = this;
            if (this.config.panelInfo == undefined) {
                this.config.panelInfo = { width: 40, height: 30, vgap: 0, hgap: 0 };
            }
            this.boundRect = new Kinetic.Rect({
                x: 0, y: 0,
                stroke: 'green',
                width: this.config.width,
                height: this.config.height,
            });
            this.groupPanels = new Kinetic.Group({ x: 0, y: 0,
                width: this.config.width, height: this.config.height
            });
            if (config.rotation != null)
                this.setRotationDeg(config.rotation);
            this.kgroup.on('dragstart', function () { document.body.style.cursor = 'move'; me.config.onclicked(me); });
            this.kgroup.on('dragend', function () { document.body.style.cursor = 'default'; });
            this.kgroup.add(this.boundRect);
            this.kgroup.add(this.groupPanels);
            this.topLeft = new HdSolar.Anchor({ parent: this, position: { x: 0, y: 0 }, name: 'topLeft', dummy: true });
            this.topRight = new HdSolar.Anchor({ parent: this, position: { x: this.config.width, y: 0 }, name: 'topRight', dummy: true });
            this.bottomLeft = new HdSolar.Anchor({ parent: this, position: { x: 0, y: this.config.height }, name: 'bottomLeft', dummy: true });
            this.bottomRight = new HdSolar.Anchor({
                parent: this, position: { x: this.config.width, y: this.config.height }, name: 'bottomRight',
                positionCallbackFunc: function () {
                    return {
                        x: me.topLeft.x() + me.boundRect.width(),
                        y: me.topLeft.y() + me.boundRect.height(),
                    };
                }
            });
            var rcfg = {
                parent: this,
                position: { x: this.config.width, y: 0 },
                name: 'rotator', dummy: false, fill: 'yellow'
            };
            rcfg.dragBoundFunc = function (pos) {
                var layer = me.getLayer();
                var groupPos = { x: 0, y: 0 };
                var gapos = me.getAbsolutePosition();
                var rpos = { x: pos.x - gapos.x, y: pos.y - gapos.y };
                var lrot = layer.getRotationDeg();
                var rotation = Utils.degrees(Utils.angle(groupPos.x, groupPos.y, rpos.x, rpos.y));
                rotation -= lrot;
                me.setRotationDeg(rotation);
                me.groupPanels.moveToTop();
                Rectangle.resetRotation(me.azAnchor);
                me.onRotate(me.getAzimuth());
                layer.draw();
                return pos;
            };
            rcfg.positionCallbackFunc = function () {
                return me.topRight.getPosition();
            };
            this.rotator = new HdSolar.RotatorAnchor(rcfg);
            this.addCloseButton();
            this.addAzControl();
            this.drawPanels();
        };
        Rectangle.prototype.update2 = function () {
            this.bottomLeft.y(this.bottomRight.y());
            this.topRight.x(this.bottomRight.x());
        };
        Rectangle.prototype.changeZoom = function (isZoomIn) {
            var f = isZoomIn ? 2.0 : 0.5;
            this.kgroup.x(this.kgroup.x() * f);
            this.kgroup.y(this.kgroup.y() * f);
            var br = this.bottomRight;
            br.x(br.x() * f);
            br.y(br.y() * f);
            this.config.panelInfo.width = this.config.panelInfo.width * f;
            this.config.panelInfo.height = this.config.panelInfo.height * f;
            this.config.panelInfo.hgap = this.config.panelInfo.hgap * f;
            this.config.panelInfo.vgap = this.config.panelInfo.vgap * f;
            this.row = this.col = 0;
            this.update();
        };
        Rectangle.prototype.update = function () {
            var a = this.bottomRight;
            var aX = a.x();
            var aY = a.y();
            var p = this.pslopeInfoOly ? this.config.panelInfo : this.translatePanelInfo(this.config.panelInfo);
            if (this.pslopeprt) {
                var t = p.height;
                p.height = p.width;
                p.width = t;
            }
            var minX = this.topLeft.x() + p.width;
            var minY = this.topLeft.y() + p.height;
            if (aX < minX)
                aX = minX;
            if (aY < minY)
                aY = minY;
            this.bottomLeft.y(aY);
            this.topRight.x(aX);
            this.groupPanels.setPosition(this.topLeft.getPosition());
            this.boundRect.setPosition(this.topLeft.getPosition());
            var width = this.topRight.x() - this.topLeft.x();
            var height = this.bottomLeft.y() - this.topLeft.y();
            if (width && height) {
                this.rotator.setPosition(this.topRight.getPosition());
                this.kgroup.setSize({ width: width, height: height });
                this.boundRect.setSize({ width: width, height: height });
                this.drawPanels();
                this.groupAz.setPosition({ x: width / 2, y: height / 2 });
                this.adjustAzAnchorPlacement();
                this.groupClose.x(-20);
            }
        };
        Rectangle.prototype.addCloseButton = function () {
            var m = this;
            var szw = 14;
            this.groupClose = new Kinetic.Group({ x: -20, y: -szw / 2, width: szw, height: szw, draggable: false });
            var l1 = new Kinetic.Line({ stroke: 'black', strokeWidth: 1.5, listening: false, points: [4, 4, 10, 10] });
            var l2 = new Kinetic.Line({ stroke: 'black', strokeWidth: 1.5, listening: false, points: [4, 10, 10, 4] });
            var cr = szw / 2;
            var boundShape = new Kinetic.Circle({
                x: cr,
                y: cr,
                radius: cr,
                fill: 'lightcoral'
            });
            this.groupClose.add(boundShape);
            this.groupClose.add(l1);
            this.groupClose.add(l2);
            this.groupClose.on('mouseover', function () {
                var layer = this.getLayer();
                l1.setStroke('white');
                l2.setStroke('white');
                boundShape.setFill('red');
                layer.draw();
            });
            this.groupClose.on('mouseout', function () {
                var layer = this.getLayer();
                boundShape.setFill('lightcoral');
                l1.setStroke('black');
                l2.setStroke('black');
                layer.draw();
            });
            this.groupClose.on('mousedown touchstart', function () {
                var layer = this.getLayer();
                boundShape.setFill('Chocolate');
                l1.setStroke('white');
                l2.setStroke('white');
                layer.draw();
            });
            this.groupClose.on('mouseup touchend', function () {
                var layer = m.getLayer();
                boundShape.setFill('red');
                l1.setStroke('white');
                l2.setStroke('white');
                m.close();
            });
            this.kgroup.add(this.groupClose);
        };
        Rectangle.prototype.close = function () {
            var onchange = (this.config.onchange != null) ? function (o) { } :
                this.config.onchange;
            this.onRotate(0);
            this.destroy();
            onchange(this);
        };
        Rectangle.prototype.setPanelPortrait = function (isprt) {
            if (this.pslopeprt != isprt) {
                this.pslopeprt = isprt;
                for (var r = 0; r < this.solarPanels.length; r++) {
                    for (var c = 0; c < this.solarPanels[r].length; c++) {
                        this.solarPanels[r][c].setPortrait(isprt);
                    }
                }
                this.update();
            }
        };
        Rectangle.prototype.addAzControl = function () {
            var aw = 16, ah = 6;
            var pts = [0, 0, 80, 0];
            var me = this;
            this.groupAz = new Kinetic.Group({ x: this.config.width / 2, y: this.config.height / 2, width: this.config.width, height: this.config.height });
            var ln = new Kinetic.Line({ points: pts, stroke: 'red', opacity: 1, strokeWidth: 0.5 });
            this.azLine = ln;
            this.groupAz.add(ln);
            this.azAnchor = new Kinetic.Shape({
                x: pts[2], y: pts[3],
                fill: 'yellow', draggable: true,
                stroke: 'black', strokeWidth: 1,
                drawFunc: function (c) {
                    c.beginPath();
                    var p = [1, 11, 15, 18, 0, 24];
                    c.moveTo(0, 0);
                    c.bezierCurveTo(-p[0], -p[1], -p[2], -p[3], p[4], -p[5]);
                    c.bezierCurveTo(p[2], -p[3], p[0], -p[1], 0, 0);
                    c.fillStrokeShape(this);
                    c.closePath();
                },
                dragBoundFunc: function (p) {
                    var layer = this.getLayer();
                    var gp = { x: 0, y: 0 };
                    var gapos = me.groupAz.getAbsolutePosition();
                    var rpos = { x: p.x - gapos.x, y: p.y - gapos.y };
                    var lrot = layer.getRotationDeg();
                    var grot = me.kgroup.getRotationDeg();
                    var r = Utils.degrees(Utils.angle(gp.x, gp.y, rpos.x, rpos.y)) - lrot - grot;
                    var d = Utils.distance(gp.x, gp.y, rpos.x, rpos.y);
                    me.groupAz.setRotationDeg(r);
                    Rectangle.resetRotation(this);
                    ln.setPoints([0, 0, d, 0]);
                    layer.draw();
                    return p;
                }
            });
            this.azAnchor.on('mouseover', function () {
                var layer = this.getLayer();
                document.body.style.cursor = 'pointer';
                this.fill('#F4A460');
                layer.draw();
            });
            this.azAnchor.on('mouseout', function () {
                var layer = this.getLayer();
                document.body.style.cursor = 'default';
                this.fill('yellow');
                layer.draw();
            });
            this.azAnchor.on('dragend', function () {
                document.body.style.cursor = 'default';
                var er = me.groupAz.getRotationDeg();
                var f = Math.floor((er + 45) / 90);
                var na = 90 * f;
                var tween = new Kinetic.Tween({
                    node: me.groupAz,
                    duration: 0.4,
                    rotationDeg: na,
                    easing: Kinetic.Easings.EaseInOut
                });
                tween.play();
                var mx = (na == 0 || na == 180 || na == -180) ? me.boundRect.width() : me.boundRect.height();
                mx = mx / 2 + 30;
                var tx = new Kinetic.Tween({
                    node: me.azAnchor,
                    duration: 0.4,
                    x: mx,
                    easing: Kinetic.Easings.EaseInOut
                });
                tx.play();
                var t = setInterval(function () {
                    ln.setPoints([0, 0, me.azAnchor.x(), 0]);
                    Rectangle.resetRotation(me.azAnchor);
                    me.onRotate(me.getAzimuth(na));
                }, 20);
                setTimeout(function () {
                    if (me.config.syncOrientation) {
                        var az = me.azimuth_offset + me.groupAz.getRotationDeg();
                        if (az < 0)
                            az = 360 + az;
                        if (az >= 360)
                            az = az - 360;
                        me.setPanelPortrait(az == 90 || az == 270);
                    }
                    clearInterval(t);
                }, 450);
                this.getLayer().draw();
                me.onRotate(me.getAzimuth(na));
            });
            this.groupAz.add(this.azAnchor);
            this.kgroup.add(this.groupAz);
            this.setAzimuth(this.config.azimuth || 0);
        };
        Rectangle.prototype.adjustAzAnchorPlacement = function () {
            var er = this.groupAz.getRotationDeg();
            var f = Math.floor((er + 45) / 90);
            var na = 90 * f;
            var mx = (na == 0 || na == 180 || na == -180) ? this.boundRect.width() : this.boundRect.height();
            mx = mx / 2 + 30;
            this.azAnchor.x(mx);
            this.azLine.setPoints([0, 0, mx, 0]);
        };
        Rectangle.prototype.onRotate = function (deg) {
            if (typeof (this.config.onrotate) != 'undefined') {
                this.config.onrotate(this, deg);
            }
        };
        Rectangle.resetRotation = function (ctl) {
            var p = ctl.getParent();
            var rr = 0;
            while (p != undefined) {
                rr += p.getRotationDeg();
                p = p.getParent();
            }
            ctl.setRotationDeg(-rr);
            var l = ctl.getLayer();
            if (l != undefined)
                l.draw();
        };
        Rectangle.prototype.translatePanelInfo = function (panelInfo) {
            var sfact = Math.cos(Utils.radians(this.pslope));
            return {
                width: panelInfo.width,
                height: panelInfo.height * sfact,
                vgap: panelInfo.vgap * sfact,
                hgap: panelInfo.hgap
            };
        };
        Rectangle.prototype.drawPanels = function () {
            var p = this.pslopeInfoOly ? this.config.panelInfo : this.translatePanelInfo(this.config.panelInfo);
            if (this.pslopeprt) {
                var t = p.height;
                p.height = p.width;
                p.width = t;
            }
            var g = this.kgroup.getSize();
            var pw = (p.width + p.hgap);
            var ph = (p.height + p.vgap);
            var cl = Math.floor(g.width / pw);
            var ro = Math.floor(g.height / ph);
            if (cl == this.col && ro == this.row)
                return;
            this.col = cl;
            this.row = ro;
            var me = this;
            var rl = this.solarPanels.length;
            var maxr = (this.row > rl) ? this.row : rl;
            var hoff = p.hgap / 2, voff = p.vgap / 2;
            for (var r = 0; r < maxr; r++) {
                if (this.solarPanels[r] == null)
                    this.solarPanels[r] = new Array(this.col);
                var rc = this.solarPanels[r].length;
                var maxc = (this.col > rc) ? this.col : rc;
                for (var c = 0; c < maxc; c++) {
                    var s = { x: hoff + pw * c, y: voff + ph * r };
                    if (this.solarPanels[r][c] == null)
                        this.solarPanels[r][c] = new SolarPanel({
                            parent: this.groupPanels,
                            position: s,
                            width: p.width,
                            height: p.height,
                            isprt: this.pslopeprt,
                            onPanelCountChanged: function () { me.onPanelCountChanged(); }
                        });
                    var v = r < this.row && c < this.col;
                    this.solarPanels[r][c].setVisible(v);
                    this.solarPanels[r][c].setOpaque(this.bopq);
                    this.solarPanels[r][c].setBound(s, p);
                    this.solarPanels[r][c].setPortrait(this.pslopeprt);
                }
            }
            this.onPanelCountChanged();
            this.getLayer().draw();
        };
        Rectangle.prototype.setAzimuth = function (azimuth) {
            var kr = this.kgroup.getRotationDeg();
            var a = azimuth - this.azimuth_offset - kr;
            this.groupAz.setRotationDeg(a);
            Rectangle.resetRotation(this.azAnchor);
        };
        Rectangle.prototype.getAzimuth = function (azr) {
            var az = Number(this.kgroup.getRotationDeg()) + this.azimuth_offset;
            az += (azr == undefined) ? Number(this.groupAz.getRotationDeg()) : azr;
            if (az < 0)
                az = 360 + az;
            if (az >= 360)
                az = az - 360;
            return az;
        };
        Rectangle.prototype.setRotationDeg = function (rotation) {
            this.kgroup.setRotationDeg(rotation);
            Rectangle.resetRotation(this.azAnchor);
        };
        Rectangle.prototype.onPanelCountChanged = function () {
            this.panelCount = this.row * this.col - this.getEmptyCount();
            if (this.config.onchange != null)
                this.config.onchange(this);
            if (this.panelCount <= 0) {
                var m = this;
                setTimeout(function () {
                    m.close();
                }, 500);
            }
        };
        Rectangle.prototype.getEmptyCount = function () {
            var n = 0;
            for (var r = 0; r < this.row; r++)
                for (var c = 0; c < this.col; c++)
                    if (this.solarPanels[r][c].isEmpty())
                        n++;
            return n;
        };
        Rectangle.prototype.getEmptyMap = function () {
            var e = new Array(this.row);
            for (var r = 0; r < this.row; r++) {
                e[r] = new Array(this.col);
                for (var c = 0; c < this.col; c++)
                    e[r][c] = this.solarPanels[r][c].isEmpty();
            }
            return e;
        };
        Rectangle.prototype.showControls = function (s) {
            var cs = [this.groupAz, this.groupClose, this.rotator, this.bottomRight, this.boundRect];
            cs.forEach(function (c) { s ? c.show() : c.hide(); });
            this.bopq = !s;
            this.row = this.col = 0;
            this.update();
        };
        Rectangle.prototype.setSelected = function (s) {
            if (this.bselected != s) {
                _super.prototype.setSelected.call(this, s);
                this.showControls(s);
                this.boundRect.setStroke(s ? 'red' : 'none');
                this.boundRect.setStrokeWidth(s ? 3 : 0);
                this.getLayer().draw();
            }
        };
        return Rectangle;
    })(BaseShape);
    ;
})(HdSolar || (HdSolar = {}));;
(function (HdSolar) {
    var RotatorAnchor = (function (_super) {
        __extends(RotatorAnchor, _super);
        function RotatorAnchor(config) {
            _super.call(this, config);
            this.init();
        }
        RotatorAnchor.prototype.init = function () {
            var me = this;
            this.anchor.on('mousedown touchstart', function () {
                me.parent.getGroup().setDraggable(false);
                this.moveToTop();
            });
        };
        RotatorAnchor.prototype.drawGraphics = function (group) {
            var cfg = {
                fill: 'yellow',
                strokeWidth: 1,
                radius: 5,
                opacity: 0
            };
            this.circle = new Kinetic.Circle(cfg);
            group.add(this.circle);
            this.path = new Kinetic.Path({
                x: -8, y: -8,
                data: 'M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z',
                scale: { x: 0.3, y: 0.3 }, fill: 'blue'
            });
            group.add(this.path);
        };
        RotatorAnchor.prototype.onHover = function (isHoverIn) {
            this.path.setFill(isHoverIn ? 'red' : 'blue');
        };
        return RotatorAnchor;
    })(HdSolar.BaseAnchor);
    HdSolar.RotatorAnchor = RotatorAnchor;
})(HdSolar || (HdSolar = {}));
