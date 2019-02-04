(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('fragl')) :
    typeof define === 'function' && define.amd ? define(['fragl'], factory) :
    (global['fragl-displace'] = factory(global.FraGL));
}(this, (function (FraGL) { 'use strict';

    FraGL = FraGL && FraGL.hasOwnProperty('default') ? FraGL['default'] : FraGL;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var inst = null;

    function af() {
        if (!inst) inst = new AF();
        return inst;
    }

    var AF = function () {
        function AF() {
            _classCallCheck(this, AF);

            this._frame = null;
            this._stopped = true;
            this._oneRead = [];
            this._oneWrite = [];
            this._read = [];
            this._write = [];

            this._animate = this._animate.bind(this);
            if (typeof window !== 'undefined') this.start();
        }

        _createClass(AF, [{
            key: 'start',
            value: function start() {
                if (!this._stopped) return;
                this._stopped = false;
                this._animate();
            }
        }, {
            key: 'stop',
            value: function stop() {
                if (this._stopped) return;
                this._stopped = true;
                window.cancelAnimationFrame(this._frame);
            }
        }, {
            key: '_animate',
            value: function _animate() {
                var oW = this._oneWrite,
                    oR = this._oneRead,
                    r = this._read,
                    w = this._write;

                var i = void 0;

                // do one read, remove and trigger; then trigger loop reads
                while (oR.length) {
                    oR.shift()();
                }for (i = 0; i < r.length; i++) {
                    r[i]();
                } // do one write, remove and trigger; then trigger loop writes
                while (oW.length) {
                    oW.shift()();
                }for (i = 0; i < w.length; i++) {
                    w[i]();
                }this._frame = window.requestAnimationFrame(this._animate);
            }
        }, {
            key: 'onNextRead',
            value: function onNextRead(fn) {
                this._oneRead.push(fn);
            }
        }, {
            key: 'onNextWrite',
            value: function onNextWrite(fn) {
                this._oneWrite.push(fn);
            }
        }, {
            key: 'addRead',
            value: function addRead(fn) {
                this._read.push(fn);
            }
        }, {
            key: 'addWrite',
            value: function addWrite(fn) {
                this._write.push(fn);
            }
        }, {
            key: 'removeRead',
            value: function removeRead(fn) {
                var r = this._read,
                    l = r.length;
                for (var i = 0; i < l; i++) {
                    if (r[i] === fn) r.splice(i, 1);
                }
            }
        }, {
            key: 'removeWrite',
            value: function removeWrite(fn) {
                var w = this._write,
                    l = w.length;
                for (var i = 0; i < l; i++) {
                    if (w[i] === fn) w.splice(i, 1);
                }
            }
        }]);

        return AF;
    }();

    var frag = "precision highp float;\n#define GLSLIFY 1\n\nuniform sampler2D u_disp;\nuniform sampler2D u_mask;\nuniform sampler2D u_texture;\nuniform vec2 u_mouse;\nuniform bool u_hasMask;\n\nvarying vec2 vUv;\n\nvoid main() {\n\n    vec4 disp = texture2D(u_disp, vUv);\n    float depth = disp.r;\n    vec2 frag = vUv;\n\n    frag.x += 0.03 * (depth-0.5) * u_mouse.x;\n    frag.y += -0.03 * (depth-0.5) * u_mouse.y;\n\n    float a = 1.;\n\n    if(u_hasMask) {\n        vec4 hidden = texture2D(u_mask, frag);\n        a = dot(hidden.rgb, vec3(1.) );\n        if( a == 0.) discard;\n    }\n\n    vec4 pixel = texture2D(u_texture, frag);\n\n    gl_FragColor = vec4(pixel.rgb, a);\n}"; // eslint-disable-line

    var vert = "#define GLSLIFY 1\nattribute vec2 a_position;\nattribute vec2 a_texcoord;\n\nvarying vec2 vUv;\nvarying vec4 v_color;\n\nuniform float u_ratio;\nuniform vec2 u_res;\n\nvec2 uv_cover(float canvasRatio, float imageRatio, vec2 uv){\n    vec2 temp = uv;\n\n    if(canvasRatio > imageRatio){\n        temp.y *= imageRatio/canvasRatio;\n        temp.y += (1. - imageRatio/canvasRatio ) * 0.5 ;\n    }else{\n        temp.x /= imageRatio/canvasRatio;\n        temp.x += ( 1. - canvasRatio/imageRatio ) * 0.5;\n    }\n\n    return temp;\n}\n\nvec2 uv_scale( vec2 uv, float val){\n    vec2 temp = uv;\n\n    temp /= val;\n    temp += ( val - 1. ) / val * 0.5;\n\n    return temp;\n}\n\nvoid main() {\n    gl_Position = vec4(vec3(a_position, 1).xy, 0, 1);\n\n    vUv = a_texcoord;\n\n    float canvasRatio = u_res.x / u_res.y;\n    float imageRatio = u_ratio;\n\n    vUv = uv_cover(canvasRatio, imageRatio, vUv);\n\n    vUv = uv_scale(vUv, 1.1);\n\n    v_color = gl_Position * 0.5 + 0.5;\n}"; // eslint-disable-line

    var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Displace = function () {
        function Displace(_ref) {
            var _this = this;

            var canvas = _ref.canvas,
                imageSize = _ref.imageSize;

            _classCallCheck$1(this, Displace);

            this.mouse = { x: 0, y: 0 };
            this.animMouse = { x: 0, y: 0 };
            this.timeout = null;
            this.layers = [];
            this.running = true;

            this.addLayer = function (_ref2) {
                var displace = _ref2.displace,
                    _ref2$mask = _ref2.mask,
                    mask = _ref2$mask === undefined ? false : _ref2$mask,
                    main = _ref2.main;


                var mainTex = _this.fragl.textureFromImage(main);
                var dispTex = _this.fragl.textureFromImage(displace);
                var maskTex = mask ? _this.fragl.textureFromImage(mask) : mainTex;

                var layer = _this.fragl.createRenderLayer(main, {
                    uniforms: {
                        u_res: {
                            value: [window.innerWidth, window.innerHeight]
                        },
                        u_mouse: {
                            value: [0, 0]
                        },
                        u_texture: {
                            value: mainTex
                        },
                        u_disp: {
                            value: dispTex
                        },
                        u_mask: {
                            value: maskTex
                        },
                        u_hasMask: {
                            value: mask ? true : false
                        },
                        u_ratio: {
                            value: _this.ratio
                        }
                    },
                    vertex: vert,
                    fragment: frag
                });

                _this.layers.push(layer);
            };

            this.update = function () {
                var scope = _this;
                _this.animMouse.x += (_this.mouse.x - _this.animMouse.x) * 0.1;
                _this.animMouse.y += (_this.mouse.y - _this.animMouse.y) * 0.1;

                _this.fragl.clear();

                _this.layers.forEach(function (layer) {
                    layer.uniforms['u_mouse'].value[0] = scope.animMouse.x;
                    layer.uniforms['u_mouse'].value[1] = scope.animMouse.y;

                    layer.render();
                });
            };

            this.resize = function () {
                var scope = _this;

                clearTimeout(_this.timeout);

                _this.timeout = setTimeout(function () {
                    var rect = scope.canvas.getBoundingClientRect();
                    var w = rect.width,
                        h = rect.height;


                    scope.fragl.setSize(w, h);
                    scope.layers.forEach(function (layer) {
                        layer.uniforms['u_res'].value = [w, h];
                        layer.render();
                    });
                }, 100);
            };

            this.mousemove = function (e) {
                var x = e.clientX,
                    y = e.clientY;
                var _window = window,
                    w = _window.innerWidth,
                    h = _window.innerHeight;


                _this.mouse.x = x / w * 2 - 1;
                _this.mouse.y = (y / h * 2 - 1) * -1;
            };

            var args = {
                clearColor: [1., 1., 1., 1.],
                imageLoadColor: [0, 0, 0, 255],
                canvas: canvas
            };

            this.fragl = new FraGL(args);
            this.ratio = imageSize.width / imageSize.height;
            this.canvas = canvas;

            window.addEventListener('mousemove', this.mousemove);
            window.addEventListener('resize', this.resize);

            this.resize();

            this.af = af();
            this.af.addWrite(this.update);
        }

        _createClass$1(Displace, [{
            key: 'stop',
            value: function stop() {
                if (this.running) this.af.removeWrite(this.update);
                this.running = false;
            }
        }, {
            key: 'start',
            value: function start() {
                if (!this.running) this.af.addWrite(this.update);
                this.running = true;
            }
        }]);

        return Displace;
    }();

    return Displace;

})));
