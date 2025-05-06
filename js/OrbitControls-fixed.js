// OrbitControls.js 修复版本
// 这是一个简化的OrbitControls实现，不使用import语句
// 基于THREE.js的OrbitControls控制器

THREE.OrbitControls = function(object, domElement) {
  this.object = object;
  this.domElement = domElement;
  this.domElement.style.touchAction = 'none'; // 禁用触摸滚动

  // 设置为false以禁用此控制
  this.enabled = true;

  // "target"设置焦点位置，对象围绕该点轨道运行
  this.target = new THREE.Vector3();

  // 你可以在多远的距离内放大和缩小（仅限PerspectiveCamera）
  this.minDistance = 0;
  this.maxDistance = Infinity;

  // 你可以垂直轨道多远，上限和下限
  // 范围是0到Math.PI弧度
  this.minPolarAngle = 0; // 弧度
  this.maxPolarAngle = Math.PI; // 弧度

  // 设置为true以启用阻尼（惯性）
  // 如果启用阻尼，您必须在动画循环中调用controls.update()
  this.enableDamping = false;
  this.dampingFactor = 0.05;

  // 此选项实际上可以进行放大和缩小；为了向后兼容保留为"zoom"
  // 设置为false以禁用缩放
  this.enableZoom = true;
  this.zoomSpeed = 1.0;

  // 设置为false以禁用旋转
  this.enableRotate = true;
  this.rotateSpeed = 1.0;

  // 设置为false以禁用平移
  this.enablePan = true;
  this.panSpeed = 1.0;
  this.screenSpacePanning = true; // 如果为false，则与世界空间方向正交平移camera.up
  this.keyPanSpeed = 7.0; // 每次按下箭头键移动的像素数

  // 用于重置
  this.position0 = this.object.position.clone();
  this.target0 = this.target.clone();
  this.zoom0 = this.object.zoom;

  // 当前位置
  var scope = this;
  var changeEvent = { type: 'change' };
  var startEvent = { type: 'start' };
  var endEvent = { type: 'end' };

  var STATE = {
    NONE: - 1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
  };

  var state = STATE.NONE;

  var EPS = 0.000001;

  // 当前位置相对于中心的球坐标
  var spherical = new THREE.Spherical();
  var sphericalDelta = new THREE.Spherical();

  var scale = 1;
  var panOffset = new THREE.Vector3();
  var zoomChanged = false;

  var rotateStart = new THREE.Vector2();
  var rotateEnd = new THREE.Vector2();
  var rotateDelta = new THREE.Vector2();

  var panStart = new THREE.Vector2();
  var panEnd = new THREE.Vector2();
  var panDelta = new THREE.Vector2();

  var dollyStart = new THREE.Vector2();
  var dollyEnd = new THREE.Vector2();
  var dollyDelta = new THREE.Vector2();

  function getAutoRotationAngle() {
    return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
  }

  function getZoomScale() {
    return Math.pow(0.95, scope.zoomSpeed);
  }

  function rotateLeft(angle) {
    sphericalDelta.theta -= angle;
  }

  function rotateUp(angle) {
    sphericalDelta.phi -= angle;
  }

  var panLeft = function () {
    var v = new THREE.Vector3();
    return function panLeft(distance, objectMatrix) {
      v.setFromMatrixColumn(objectMatrix, 0); // 获取矩阵的第一列
      v.multiplyScalar(-distance);
      panOffset.add(v);
    };
  }();

  var panUp = function () {
    var v = new THREE.Vector3();
    return function panUp(distance, objectMatrix) {
      if (scope.screenSpacePanning === true) {
        v.setFromMatrixColumn(objectMatrix, 1);
      } else {
        v.setFromMatrixColumn(objectMatrix, 0);
        v.crossVectors(scope.object.up, v);
      }
      v.multiplyScalar(distance);
      panOffset.add(v);
    };
  }();

  // 更新函数
  this.update = function() {
    var offset = new THREE.Vector3();
    var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
    var quatInverse = quat.clone().invert();
    var lastPosition = new THREE.Vector3();
    var lastQuaternion = new THREE.Quaternion();

    return function update() {
      var position = scope.object.position;
      offset.copy(position).sub(scope.target);
      
      // 旋转偏移到"y轴向上"空间
      offset.applyQuaternion(quat);
      
      // 角度从z轴绕y轴
      spherical.setFromVector3(offset);
      
      if (scope.enableDamping) {
        spherical.theta += sphericalDelta.theta * scope.dampingFactor;
        spherical.phi += sphericalDelta.phi * scope.dampingFactor;
      } else {
        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;
      }
      
      // 将phi限制在范围内以避免翻转
      spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
      spherical.makeSafe();
      
      // 处理缩放
      spherical.radius *= scale;
      
      // 将半径限制在范围内
      spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
      
      // 将目标移动到平移位置
      scope.target.add(panOffset);
      
      // 从球坐标重建偏移量
      offset.setFromSpherical(spherical);
      
      // 将旋转从"y轴向上"空间旋转回物体空间
      offset.applyQuaternion(quatInverse);
      
      position.copy(scope.target).add(offset);
      scope.object.lookAt(scope.target);
      
      if (scope.enableDamping === true) {
        sphericalDelta.theta *= (1 - scope.dampingFactor);
        sphericalDelta.phi *= (1 - scope.dampingFactor);
        panOffset.multiplyScalar(1 - scope.dampingFactor);
      } else {
        sphericalDelta.set(0, 0, 0);
        panOffset.set(0, 0, 0);
      }
      
      scale = 1;
      
      return false;
    };
  }();

  function onMouseDown(event) {
    if (scope.enabled === false) return;
    
    event.preventDefault();
    
    switch (event.button) {
      case 0: // 左键
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (scope.enablePan === false) return;
          handleMouseDownPan(event);
          state = STATE.PAN;
        } else {
          if (scope.enableRotate === false) return;
          handleMouseDownRotate(event);
          state = STATE.ROTATE;
        }
        break;
        
      case 1: // 中键
        if (scope.enableZoom === false) return;
        handleMouseDownDolly(event);
        state = STATE.DOLLY;
        break;
        
      case 2: // 右键
        if (scope.enablePan === false) return;
        handleMouseDownPan(event);
        state = STATE.PAN;
        break;
    }
    
    if (state !== STATE.NONE) {
      document.addEventListener('mousemove', onMouseMove, false);
      document.addEventListener('mouseup', onMouseUp, false);
    }
  }
  
  function handleMouseDownRotate(event) {
    rotateStart.set(event.clientX, event.clientY);
  }
  
  function handleMouseDownDolly(event) {
    dollyStart.set(event.clientX, event.clientY);
  }
  
  function handleMouseDownPan(event) {
    panStart.set(event.clientX, event.clientY);
  }
  
  function onMouseMove(event) {
    if (scope.enabled === false) return;
    
    event.preventDefault();
    
    switch (state) {
      case STATE.ROTATE:
        if (scope.enableRotate === false) return;
        handleMouseMoveRotate(event);
        break;
        
      case STATE.DOLLY:
        if (scope.enableZoom === false) return;
        handleMouseMoveDolly(event);
        break;
        
      case STATE.PAN:
        if (scope.enablePan === false) return;
        handleMouseMovePan(event);
        break;
    }
  }
  
  function handleMouseMoveRotate(event) {
    rotateEnd.set(event.clientX, event.clientY);
    rotateDelta.subVectors(rotateEnd, rotateStart);
    
    var element = scope.domElement;
    rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
    rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
    
    rotateStart.copy(rotateEnd);
    scope.update();
  }
  
  function handleMouseMoveDolly(event) {
    dollyEnd.set(event.clientX, event.clientY);
    dollyDelta.subVectors(dollyEnd, dollyStart);
    
    if (dollyDelta.y > 0) {
      dollyOut(getZoomScale());
    } else if (dollyDelta.y < 0) {
      dollyIn(getZoomScale());
    }
    
    dollyStart.copy(dollyEnd);
    scope.update();
  }
  
  function dollyOut(dollyScale) {
    scale /= dollyScale;
  }
  
  function dollyIn(dollyScale) {
    scale *= dollyScale;
  }
  
  function handleMouseMovePan(event) {
    panEnd.set(event.clientX, event.clientY);
    panDelta.subVectors(panEnd, panStart);
    
    pan(panDelta.x, panDelta.y);
    
    panStart.copy(panEnd);
    scope.update();
  }
  
  function pan(deltaX, deltaY) {
    var element = scope.domElement;
    
    var offset = new THREE.Vector3();
    var position = scope.object.position;
    offset.copy(position).sub(scope.target);
    var targetDistance = offset.length();
    
    // 半长宽比
    targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);
    
    // 左右移动像素数对应的世界坐标系距离
    panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
    
    // 上下移动像素数对应的世界坐标系距离
    panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
  }
  
  function onMouseUp(event) {
    if (scope.enabled === false) return;
    
    document.removeEventListener('mousemove', onMouseMove, false);
    document.removeEventListener('mouseup', onMouseUp, false);
    
    state = STATE.NONE;
  }
  
  function onMouseWheel(event) {
    if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    if (event.deltaY < 0) {
      dollyIn(getZoomScale());
    } else if (event.deltaY > 0) {
      dollyOut(getZoomScale());
    }
    
    scope.update();
  }
  
  function onContextMenu(event) {
    if (scope.enabled === false) return;
    event.preventDefault();
  }
  
  function onTouchStart(event) {
    if (scope.enabled === false) return;
    
    event.preventDefault();
    
    switch (event.touches.length) {
      case 1: // 单指
        if (scope.enableRotate === false) return;
        handleTouchStartRotate(event);
        state = STATE.TOUCH_ROTATE;
        break;
        
      case 2: // 双指
        if (scope.enableZoom === false) return;
        handleTouchStartDolly(event);
        state = STATE.TOUCH_DOLLY_ROTATE;
        break;
        
      default:
        state = STATE.NONE;
    }
  }
  
  function handleTouchStartRotate(event) {
    rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
  }
  
  function handleTouchStartDolly(event) {
    var dx = event.touches[0].pageX - event.touches[1].pageX;
    var dy = event.touches[0].pageY - event.touches[1].pageY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    dollyStart.set(0, distance);
  }
  
  function onTouchMove(event) {
    if (scope.enabled === false) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    switch (event.touches.length) {
      case 1: // 单指
        if (scope.enableRotate === false) return;
        if (state !== STATE.TOUCH_ROTATE) return;
        handleTouchMoveRotate(event);
        scope.update();
        break;
        
      case 2: // 双指
        if (scope.enableZoom === false) return;
        if (state !== STATE.TOUCH_DOLLY_ROTATE) return;
        handleTouchMoveDollyRotate(event);
        scope.update();
        break;
        
      default:
        state = STATE.NONE;
    }
  }
  
  function handleTouchMoveRotate(event) {
    rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    rotateDelta.subVectors(rotateEnd, rotateStart);
    
    var element = scope.domElement;
    rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
    rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
    
    rotateStart.copy(rotateEnd);
  }
  
  function handleTouchMoveDollyRotate(event) {
    var dx = event.touches[0].pageX - event.touches[1].pageX;
    var dy = event.touches[0].pageY - event.touches[1].pageY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    dollyEnd.set(0, distance);
    dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));
    
    dollyOut(dollyDelta.y);
    dollyStart.copy(dollyEnd);
    
    // 处理旋转
    rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    rotateDelta.subVectors(rotateEnd, rotateStart);
    
    var element = scope.domElement;
    rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
    rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
    
    rotateStart.copy(rotateEnd);
  }
  
  function onTouchEnd(event) {
    if (scope.enabled === false) return;
    state = STATE.NONE;
  }
  
  // 添加事件监听器
  this.domElement.addEventListener('contextmenu', onContextMenu, false);
  this.domElement.addEventListener('mousedown', onMouseDown, false);
  this.domElement.addEventListener('wheel', onMouseWheel, false);
  this.domElement.addEventListener('touchstart', onTouchStart, false);
  this.domElement.addEventListener('touchend', onTouchEnd, false);
  this.domElement.addEventListener('touchmove', onTouchMove, false);
  
  this.dispose = function() {
    this.domElement.removeEventListener('contextmenu', onContextMenu, false);
    this.domElement.removeEventListener('mousedown', onMouseDown, false);
    this.domElement.removeEventListener('wheel', onMouseWheel, false);
    this.domElement.removeEventListener('touchstart', onTouchStart, false);
    this.domElement.removeEventListener('touchend', onTouchEnd, false);
    this.domElement.removeEventListener('touchmove', onTouchMove, false);
    document.removeEventListener('mousemove', onMouseMove, false);
    document.removeEventListener('mouseup', onMouseUp, false);
  };

  // 设置初始位置
  this.update();
}; 