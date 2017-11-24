/* eslint-disable */

import * as THREE from 'three';

class TracerContols extends THREE.EventDispatcher {
  constructor(object, domElement) {
    super();

    const _this = this;
    const STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

    this.object = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    // API

    this.enabled = true;

    this.screen = { left: 0, top: 0, width: 0, height: 0 };

    this.rotateSpeed = 1.0;
    this.slideSpeed = 1.0;
    this.zoomSpeed = 1.2;

    this.noSlide = false;
    this.noZoom = false;

    this.staticMoving = false;
    this.dynamicDampingFactor = 0.2;

    this.minDistance = 0;
    this.maxDistance = Infinity;

    this.keys = [
      65/* A */,
      83/* S */,
      68/* D */,
    ];

    // internals

    this.target = new THREE.Vector3(0, 0, 0);

    const EPS = 0.000001;

    const lastPosition = new THREE.Vector3();

    let _state = STATE.NONE;
    let _prevState = STATE.NONE;

    const _eye = new THREE.Vector3();
    const _movePrev = new THREE.Vector2();
    const _moveCurr = new THREE.Vector2();

    const _zoomStart = new THREE.Vector2();
    const _zoomEnd = new THREE.Vector2();

    let _touchZoomDistanceStart = 0;
    let _touchZoomDistanceEnd = 0;
    const _panStart = new THREE.Vector2();
    const _panEnd = new THREE.Vector2();

    // for reset

    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.up0 = this.object.up.clone();

    // events

    const changeEvent = { type: 'change' };
    const startEvent = { type: 'start' };
    const endEvent = { type: 'end' };

    // methods

    this.handleResize = () => {
      if (this.domElement === document) {
        this.screen.left = 0;
        this.screen.top = 0;
        this.screen.width = window.innerWidth;
        this.screen.height = window.innerHeight;
      } else {
        const box = this.domElement.getBoundingClientRect();
        // adjustments come from similar code in the jquery offset() function
        const d = this.domElement.ownerDocument.documentElement;
        this.screen.left = box.left + window.pageXOffset - d.clientLeft;
        this.screen.top = box.top + window.pageYOffset - d.clientTop;
        this.screen.width = box.width;
        this.screen.height = box.height;
      }
    };

    this.handleEvent = (event) => {
      if (typeof this[event.type] === 'function') {
        this[event.type](event);
      }
    };

    const getMouseOnScreen = ( function wrapper() {
      const vector = new THREE.Vector2();

      return (pageX, pageY) => {
        vector.set(
          ( pageX - _this.screen.left ) / _this.screen.width,
          ( pageY - _this.screen.top ) / _this.screen.height
        );

        return vector;
      };
    }() );

    const getBalancedMouseOnScreen = ( function wrapper() {
      const vector = new THREE.Vector2();

      return (pageX, pageY) => {
        vector.set(
          ( pageX - _this.screen.left ) / _this.screen.width,
          ( pageY - _this.screen.top ) / _this.screen.width
        );

        return vector;
      };
    }() );

    const getMouseOnCircle = ( function wrapper() {
      const vector = new THREE.Vector2();

      return (pageX, pageY) => {
        vector.set(
          ( ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / ( _this.screen.width * 0.5 ) ),
          ( ( _this.screen.height + 2 * ( _this.screen.top - pageY ) ) / _this.screen.width ) // screen.width intentional
        );

        return vector;
      };
    }() );

    this.slideCamera = ( function wrapper() {
      const eyeDirection = new THREE.Vector3();
      const upDirection = new THREE.Vector3();
      const sidewaysDirection = new THREE.Vector3();
      const moveDirection = new THREE.Vector3();

      let angle;

      return function slideCamera() {
        
        let deltaX = _moveCurr.x - _movePrev.x;
        let deltaY = _moveCurr.y - _movePrev.y;
        deltaX *= _this.slideSpeed;
        deltaY *= _this.slideSpeed;

        eyeDirection.copy(_eye).normalize();
        upDirection.copy(_this.object.up).normalize();
        sidewaysDirection.crossVectors(upDirection, eyeDirection).normalize();

        moveDirection.copy(eyeDirection);
        moveDirection.setY(0.0).normalize();
        sidewaysDirection.setY(0.0).normalize();
        // console.log("x=", deltaX, "y=", deltaY);
        // console.log(sidewaysDirection.x, sidewaysDirection.y, sidewaysDirection.z);
        
        _this.target.addScaledVector(sidewaysDirection, -deltaX);   
        _this.target.addScaledVector(moveDirection, -deltaY);     
  
        _movePrev.copy(_moveCurr);
      };
    }() );

    this.zoomCamera = () => {
      let factor;

      if (_state === STATE.TOUCH_ZOOM_PAN) {
        factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
        _touchZoomDistanceStart = _touchZoomDistanceEnd;
        _eye.multiplyScalar(factor);
      } else {
        factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

        if (factor !== 1.0 && factor > 0.0) {
          _eye.multiplyScalar(factor);

          if (_this.staticMoving) {
            _zoomStart.copy(_zoomEnd);
          } else {
            _zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;
          }
        }
      }
    };

    this.checkDistances = () => {
      if (!_this.noZoom) {
        if (_eye.lengthSq() > _this.maxDistance * _this.maxDistance) {
          _this.object.position.addVectors(_this.target, _eye.setLength(_this.maxDistance));
          _zoomStart.copy(_zoomEnd);
        }

        if (_eye.lengthSq() < _this.minDistance * _this.minDistance) {
          _this.object.position.addVectors(_this.target, _eye.setLength(_this.minDistance));
          _zoomStart.copy(_zoomEnd);
        }
      }
    };

    this.update = () => {
      _eye.subVectors(_this.object.position, _this.target);

      if (!_this.noSlide) {
        _this.slideCamera();
      }

      if (!_this.noZoom) {
        _this.zoomCamera();
      }

      _this.object.position.addVectors(_this.target, _eye);

      _this.checkDistances();

      _this.object.lookAt(_this.target);

      if (lastPosition.distanceToSquared(_this.object.position) > EPS) {
        _this.dispatchEvent(changeEvent);

        lastPosition.copy(_this.object.position);
      }
    };

    this.reset = () => {
      _state = STATE.NONE;
      _prevState = STATE.NONE;

      _this.target.copy(_this.target0);
      _this.object.position.copy(_this.position0);
      _this.object.up.copy(_this.up0);

      _eye.subVectors(_this.object.position, _this.target);

      _this.object.lookAt(_this.target);

      _this.dispatchEvent(changeEvent);

      lastPosition.copy(_this.object.position);
    };

    // listeners

    function keydown(event) {
      if (_this.enabled === false) return;

      window.removeEventListener('keydown', keydown);

      _prevState = _state;

      if (_state !== STATE.NONE) {
        return;
      }

      if (event.keyCode === _this.keys[STATE.ROTATE] && !_this.noSlide) {
        _state = STATE.ROTATE;
      } else if (event.keyCode === _this.keys[STATE.ZOOM] && !_this.noZoom) {
        _state = STATE.ZOOM;
      }
    }

    function keyup() {
      if (_this.enabled === false) return;

      _state = _prevState;

      window.addEventListener('keydown', keydown, false);
    }


    function mousemove(event) {
      if (_this.enabled === false) return;

      event.preventDefault();
      event.stopPropagation();

      if (_state === STATE.ROTATE && !_this.noSlide) {
        _movePrev.copy(_moveCurr);
        _moveCurr.copy(getBalancedMouseOnScreen(event.pageX, event.pageY));
      } else if (_state === STATE.ZOOM && !_this.noZoom) {
        _zoomEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
      }
    }

    function mouseup(event) {
      if (_this.enabled === false) return;

      event.preventDefault();
      event.stopPropagation();

      _state = STATE.NONE;

      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
      _this.dispatchEvent(endEvent);
    }

    function mousedown(event) {
      if (_this.enabled === false) return;

      event.preventDefault();
      event.stopPropagation();

      if (_state === STATE.NONE) {
        _state = event.button;
      }

      if (_state === STATE.ROTATE && !_this.noSlide) {
        _moveCurr.copy(getBalancedMouseOnScreen(event.pageX, event.pageY));
        _movePrev.copy(_moveCurr);
      } else if (_state === STATE.ZOOM && !_this.noZoom) {
        _zoomStart.copy(getMouseOnScreen(event.pageX, event.pageY));
        _zoomEnd.copy(_zoomStart);
      }

      document.addEventListener('mousemove', mousemove, false);
      document.addEventListener('mouseup', mouseup, false);

      _this.dispatchEvent(startEvent);
    }


    function mousewheel(event) {
      if (_this.enabled === false) return;

      event.preventDefault();
      event.stopPropagation();

      let delta = 0;

      if (event.wheelDelta) {
        // WebKit / Opera / Explorer 9

        delta = event.wheelDelta / 40;
      } else if (event.detail) {
        // Firefox

        delta = -event.detail / 3;
      }

      _zoomStart.y += delta * 0.01;
      _this.dispatchEvent(startEvent);
      _this.dispatchEvent(endEvent);
    }

    function touchstart(event) {
      if (_this.enabled === false) return;

      switch (event.touches.length) {
        case 1:
          _state = STATE.TOUCH_ROTATE;
          _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
          _movePrev.copy(_moveCurr);
          break;

        case 2:
          _state = STATE.TOUCH_ZOOM_PAN;
          const dx = event.touches[0].pageX - event.touches[1].pageX;
          const dy = event.touches[0].pageY - event.touches[1].pageY;
          _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);

          const x = ( event.touches[0].pageX + event.touches[1].pageX ) / 2;
          const y = ( event.touches[0].pageY + event.touches[1].pageY ) / 2;
          _panStart.copy(getMouseOnScreen(x, y));
          _panEnd.copy(_panStart);
          break;

        default:
          _state = STATE.NONE;

      }
      _this.dispatchEvent(startEvent);
    }

    function touchmove(event) {
      if (_this.enabled === false) return;

      event.preventDefault();
      event.stopPropagation();

      switch (event.touches.length) {

        case 1:
          _movePrev.copy(_moveCurr);
          _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
          break;

        case 2:
          const dx = event.touches[0].pageX - event.touches[1].pageX;
          const dy = event.touches[0].pageY - event.touches[1].pageY;
          _touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);

          const x = ( event.touches[0].pageX + event.touches[1].pageX ) / 2;
          const y = ( event.touches[0].pageY + event.touches[1].pageY ) / 2;
          _panEnd.copy(getMouseOnScreen(x, y));
          break;

        default:
          _state = STATE.NONE;
      }
    }

    function touchend(event) {
      if (_this.enabled === false) return;

      switch (event.touches.length) {
        case 1:
          _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
          _movePrev.copy(_moveCurr);
          break;

        case 2:
          _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;

          const x = ( event.touches[0].pageX + event.touches[1].pageX ) / 2;
          const y = ( event.touches[0].pageY + event.touches[1].pageY ) / 2;
          _panEnd.copy(getMouseOnScreen(x, y));
          _panStart.copy(_panEnd);
          break;

        default:
          // no touches
          break;
      }

      _state = STATE.NONE;
      _this.dispatchEvent(endEvent);
    }

    function contextmenu(event) {
      event.preventDefault();
    }

    this.dispose = () => {
      this.domElement.removeEventListener('contextmenu', contextmenu, false);
      this.domElement.removeEventListener('mousedown', mousedown, false);
      this.domElement.removeEventListener('mousewheel', mousewheel, false);
      this.domElement.removeEventListener('DOMMouseScroll', mousewheel, false); // firefox

      this.domElement.removeEventListener('touchstart', touchstart, false);
      this.domElement.removeEventListener('touchend', touchend, false);
      this.domElement.removeEventListener('touchmove', touchmove, false);

      document.removeEventListener('mousemove', mousemove, false);
      document.removeEventListener('mouseup', mouseup, false);
    };
    this.domElement.addEventListener('contextmenu', contextmenu, false);
    this.domElement.addEventListener('mousedown', mousedown, false);
    this.domElement.addEventListener('mousewheel', mousewheel, false);
    this.domElement.addEventListener('DOMMouseScroll', mousewheel, false); // firefox

    this.domElement.addEventListener('touchstart', touchstart, false);
    this.domElement.addEventListener('touchend', touchend, false);
    this.domElement.addEventListener('touchmove', touchmove, false);

    this.handleResize();

    // force an update at start
    this.update();
  }
}

export default TracerContols;

/* eslint-enable */