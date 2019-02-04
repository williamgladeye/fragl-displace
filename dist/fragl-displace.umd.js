(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global['fragl-displace'] = factory());
}(this, (function () { 'use strict';

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    /*
        Contains functions modified from greggman/webgl-fundamentals, see WEBGL_FUNDAMENTALS_LICENSE
    */

    var FraGL = function () {
        function FraGL() {
            var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck(this, FraGL);

            _initialiseProps.call(this);

            this._setArgs(args);

            this.domElement = args.canvas || document.createElement('canvas');        this.gl = this.domElement.getContext("webgl", {
                premultipliedAlpha: this.premultipliedAlpha,
                alpha: this.trasparent,
                antialias: this.antialias,
                depth: this.depth
            });

            this._resize();

            var gl = this.gl;


            gl.clearColor.apply(gl, _toConsumableArray(this._clearColor));
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
        }

        _createClass(FraGL, [{
            key: '_setArgs',
            value: function _setArgs(args) {
                if (args.imageLoadColor && Array.isArray(args.imageLoadColor) && args.imageLoadColor.length == 4) this._imageLoadColor = args.imageLoadColor;
                if (args.size) {
                    this._width = args.size.width;
                    this._height = args.size.height;
                } else {
                    this._width = window.innerWidth;
                    this._height = window.innerHeight;
                }
                if (args.clearColor && Array.isArray(args.clearColor) && args.clearColor.length == 4) this._clearColor = args.clearColor;
                if (args.trasparent) this.trasparent = args.trasparent;
                if (args.premultipliedAlpha) this.premultipliedAlpha = args.premultipliedAlpha;
                if (args.antialias) this.antialias = args.antialias;
                if (args.depth) this.depth = args.depth;
            }
        }, {
            key: '_createShader',
            value: function _createShader(content, type) {
                var gl = this.gl,
                    error = this.error;

                var shaderType = type == 'vertex' ? gl.VERTEX_SHADER : type == 'fragment' ? gl.FRAGMENT_SHADER : false;

                if (!shaderType) return error('shader type issue');

                var shader = gl.createShader(shaderType);

                gl.shaderSource(shader, content);
                gl.compileShader(shader);

                var compiledShader = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

                if (!compiledShader) {
                    error(type + ' shader compilation error: ' + gl.getShaderInfoLog(shader));
                    gl.deleteShader(shader);
                    return null;
                }

                return shader;
            }
        }, {
            key: '_nextPow2',
            value: function _nextPow2(val) {
                var v = val;
                v--;
                v |= v >> 1;
                v |= v >> 2;
                v |= v >> 4;
                v |= v >> 8;
                v |= v >> 16;
                v++;
                return v;
            }
        }, {
            key: '_checkSize',
            value: function _checkSize(image) {
                var w = image.naturalWidth,
                    h = image.naturalHeight;


                var nw = this._nextPow2(w);
                var nh = this._nextPow2(h);

                console.log(nw, nh);

                if (nw == w && nh == h) return image;

                if (!this._imageCanvas) {
                    this._imageCanvas = document.createElement('canvas');
                    this._imageCtx = this._imageCanvas.getContext('2d');
                }

                this._imageCanvas.width = nw;
                this._imageCanvas.height = nh;

                this._imageCtx.drawImage(image, 0, 0, nw, nh);

                image.src = this._imageCanvas.toDataURL();

                return image;
            }
        }, {
            key: '_loadImage',
            value: function _loadImage(src) {
                var _scope = this;
                return new Promise(function (resolve) {
                    var image = new Image();
                    image.addEventListener('load', function () {
                        image = _scope._checkSize(image);
                        resolve(image);
                    });
                    image.src = src;
                });
            }
        }, {
            key: 'textureFromImage',
            value: function textureFromImage(src) {
                var gl = this.gl,
                    _imageLoadColor = this._imageLoadColor;

                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(_imageLoadColor));

                this._loadImage(src).then(function (image) {
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    // gl.generateMipmap(gl.TEXTURE_2D);
                });
                return texture;
            }
        }, {
            key: '_createProgram',
            value: function _createProgram(_ref) {
                var _ref$vertex = _ref.vertex,
                    vertex = _ref$vertex === undefined ? '' : _ref$vertex,
                    _ref$fragment = _ref.fragment,
                    fragment = _ref$fragment === undefined ? '' : _ref$fragment;
                var gl = this.gl,
                    error = this.error;

                var vertexShader = this._createShader(vertex, 'vertex');
                var fragmentShader = this._createShader(fragment, 'fragment');
                var program = gl.createProgram();

                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);

                gl.linkProgram(program);

                var linked = gl.getProgramParameter(program, gl.LINK_STATUS);

                if (!linked) {
                    error('error linking program: ' + gl.getProgramInfoLog(program));
                    gl.deleteProgram(program);

                    return null;
                }

                return program;
            }
        }, {
            key: 'setSize',
            value: function setSize(w, h) {
                this._width = w;
                this._height = h;
                this._resize();
            }
        }, {
            key: '_resize',
            value: function _resize() {
                var gl = this.gl,
                    _width = this._width,
                    _height = this._height;


                gl.canvas.width = _width;
                gl.canvas.height = _height;

                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            }
        }, {
            key: 'createRenderLayer',
            value: function createRenderLayer(name, args) {
                var uniforms = args.uniforms;
                var gl = this.gl;
                var program = this._createProgram({
                    vertex: args.vertex,
                    fragment: args.fragment
                });

                var pLocation = gl.getAttribLocation(program, "a_position");
                var tLocation = gl.getAttribLocation(program, "a_texcoord");
                var positionBuffer = gl.createBuffer();

                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                this._setGeometry();

                var texcoordBuffer = gl.createBuffer();

                gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
                this._setTexcoord();

                var uniformSetters = this._uniformSetters(program);
                var setAttribs = function setAttribs() {
                    var size = 2;
                    var type = gl.FLOAT;
                    var normalize = false;
                    var stride = 0;
                    var offset = 0;

                    gl.enableVertexAttribArray(pLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.vertexAttribPointer(pLocation, size, type, normalize, stride, offset);

                    gl.enableVertexAttribArray(tLocation);
                    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
                    gl.vertexAttribPointer(tLocation, size, type, normalize, stride, offset);
                };

                this._renderItems[name] = {
                    uniformSetters: uniformSetters,
                    setAttribs: setAttribs,
                    uniforms: uniforms,
                    render: function render(output) {
                        var uniformSetters = this.uniformSetters,
                            setAttribs = this.setAttribs,
                            uniforms = this.uniforms;

                        gl.useProgram(program);

                        setAttribs();
                        Object.keys(uniformSetters).forEach(function (uniform) {
                            if (uniforms[uniform]) uniformSetters[uniform](uniforms[uniform].value);
                        });

                        if (output) gl.bindFramebuffer(gl.FRAMEBUFFER, output.fbo);else gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                        var primitiveType = gl.TRIANGLES;
                        var offset = 0;
                        var count = 6;

                        gl.drawArrays(primitiveType, offset, count);
                    }
                };

                return this._renderItems[name];
            }
        }, {
            key: 'createRenderTexture',


            // render = () =>{
            //     const _scope = this;
            //     this.clear();

            //     Object.keys(_scope._renderItems).forEach( function(key) {
            //         _scope._renderItems[key].render();
            //     })
            // }

            value: function createRenderTexture(_ref2) {
                var width = _ref2.width,
                    height = _ref2.height;
                var gl = this.gl;

                var target = {};

                function generate(width, height) {
                    var targetTextureWidth = width;
                    var targetTextureHeight = height;
                    var targetTexture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

                    var level = 0;
                    var internalFormat = gl.RGBA;
                    var border = 0;
                    var format = gl.RGBA;
                    var type = gl.UNSIGNED_BYTE;
                    var data = null;

                    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, targetTextureWidth, targetTextureHeight, border, format, type, data);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                    var fb = gl.createFramebuffer();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
                    var attachmentPoint = gl.COLOR_ATTACHMENT0;
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

                    return { targetTexture: targetTexture, fb: fb };
                }

                var obj = generate(width, height);

                target.fbo = obj.fb;
                target.texture = obj.targetTexture;

                target.setSize = function (width, height) {
                    gl.deleteFramebuffer(target.fbo);
                    gl.deleteTexture(target.texture);

                    var obj = generate(width, height);

                    this.fbo = obj.fb;
                    this.texture = obj.targetTexture;
                };

                return target;
            }
        }, {
            key: '_getBindPointForSamplerType',
            value: function _getBindPointForSamplerType(type) {
                var gl = this.gl;

                if (type === gl.SAMPLER_2D) return gl.TEXTURE_2D;
                if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;
            }
        }, {
            key: '_createUniformSetter',
            value: function _createUniformSetter(prog, uData) {
                var gl = this.gl;
                var name = uData.name,
                    type = uData.type,
                    size = uData.size;

                var location = gl.getUniformLocation(prog, name);
                var isArray = size > 1 && name.substr(-3) === "[0]";

                if (type === gl.FLOAT && isArray) return function (v) {
                    gl.uniform1fv(location, v);
                };
                if (type === gl.FLOAT) return function (v) {
                    gl.uniform1f(location, v);
                };
                if (type === gl.FLOAT_VEC2) return function (v) {
                    gl.uniform2fv(location, v);
                };
                if (type === gl.FLOAT_VEC3) return function (v) {
                    gl.uniform3fv(location, v);
                };
                if (type === gl.FLOAT_VEC4) return function (v) {
                    gl.uniform4fv(location, v);
                };
                if (type === gl.INT && isArray) return function (v) {
                    gl.uniform1iv(location, v);
                };
                if (type === gl.INT) return function (v) {
                    gl.uniform1i(location, v);
                };
                if (type === gl.INT_VEC2) return function (v) {
                    gl.uniform2iv(location, v);
                };
                if (type === gl.INT_VEC3) return function (v) {
                    gl.uniform3iv(location, v);
                };
                if (type === gl.INT_VEC4) return function (v) {
                    gl.uniform4iv(location, v);
                };
                if (type === gl.BOOL) return function (v) {
                    gl.uniform1iv(location, [v]);
                };
                if (type === gl.BOOL_VEC2) return function (v) {
                    gl.uniform2iv(location, v);
                };
                if (type === gl.BOOL_VEC3) return function (v) {
                    gl.uniform3iv(location, v);
                };
                if (type === gl.BOOL_VEC4) return function (v) {
                    gl.uniform4iv(location, v);
                };
                if (type === gl.FLOAT_MAT2) return function (v) {
                    gl.uniformMatrix2fv(location, false, v);
                };
                if (type === gl.FLOAT_MAT3) return function (v) {
                    gl.uniformMatrix3fv(location, false, v);
                };
                if (type === gl.FLOAT_MAT4) return function (v) {
                    gl.uniformMatrix4fv(location, false, v);
                };

                if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
                    var units = [];
                    for (var ii = 0; ii < info.size; ++ii) {
                        units.push(this._tUnit++);
                    }
                    return function (bindPoint, units) {
                        return function (textures) {
                            gl.uniform1iv(location, units);
                            textures.forEach(function (texture, index) {
                                gl.activeTexture(gl.TEXTURE0 + units[index]);
                                gl.bindTexture(bindPoint, texture);
                            });
                        };
                    }(this._getBindPointForSamplerType(type), units);
                }
                if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
                    return function (bindPoint, unit) {
                        return function (texture) {
                            gl.uniform1i(location, unit);
                            gl.activeTexture(gl.TEXTURE0 + unit);
                            gl.bindTexture(bindPoint, texture);
                        };
                    }(this._getBindPointForSamplerType(type), this._tUnit++);
                }
                throw "unknown type: 0x" + type.toString(16);
            }
        }, {
            key: '_uniformSetters',
            value: function _uniformSetters(program) {
                var gl = this.gl;

                var uniformSetters = {};
                var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

                this._tUnit = 0;

                for (var ii = 0; ii < numUniforms; ++ii) {
                    var uniformInfo = gl.getActiveUniform(program, ii);
                    if (!uniformInfo) break;
                    var name = uniformInfo.name;

                    if (name.substr(-3) === "[0]") name = name.substr(0, name.length - 3);
                    var setter = this._createUniformSetter(program, uniformInfo);
                    uniformSetters[name] = setter;
                }
                return uniformSetters;
            }
        }, {
            key: '_setGeometry',
            value: function _setGeometry() {
                var gl = this.gl;

                var top = -1;
                var bottom = 1;
                var left = -1;
                var right = 1;
                var geo = [left, top, right, top, left, bottom, right, top, right, bottom, left, bottom];

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geo), gl.STATIC_DRAW);
            }
        }, {
            key: '_setTexcoord',
            value: function _setTexcoord() {
                var gl = this.gl;

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0]), gl.STATIC_DRAW);
            }
        }, {
            key: 'error',
            value: function error(msg) {
                console.warn(msg);
                return null;
            }
        }]);

        return FraGL;
    }();

    var _initialiseProps = function _initialiseProps() {
        var _this = this;

        this._width = 0;
        this._height = 0;
        this._renderItems = {};
        this._tUnit = 0;
        this._imageLoadColor = [255, 150, 150, 255];
        this._clearColor = [0, 0, 0, 0];
        this._imageCanvas = null;
        this._imageCtx = null;
        this.trasparent = true;
        this.premultipliedAlpha = false;
        this.antialias = false;
        this.depth = false;

        this.clear = function () {
            var gl = _this.gl;

            gl.clear(gl.COLOR_BUFFER_BIT);
        };
    };

    var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var inst = null;

    function af() {
        if (!inst) inst = new AF();
        return inst;
    }

    var AF = function () {
        function AF() {
            _classCallCheck$1(this, AF);

            this._frame = null;
            this._stopped = true;
            this._oneRead = [];
            this._oneWrite = [];
            this._read = [];
            this._write = [];

            this._animate = this._animate.bind(this);
            if (typeof window !== 'undefined') this.start();
        }

        _createClass$1(AF, [{
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

    var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Displace = function () {
        function Displace(_ref) {
            var _this = this;

            var canvas = _ref.canvas,
                imageSize = _ref.imageSize;

            _classCallCheck$2(this, Displace);

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

        _createClass$2(Displace, [{
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
