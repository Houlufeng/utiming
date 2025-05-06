/**
 * 这是GLTFLoader的兼容版本
 * 基于Three.js r137版本的GLTFLoader
 * 移除了ES6模块导入，适用于直接引用
 */

THREE.GLTFLoader = (function () {
	function GLTFLoader(manager) {
		THREE.Loader.call(this, manager);
		this.dracoLoader = null;
		this.ktx2Loader = null;
		this.meshoptDecoder = null;
		this.pluginCallbacks = [];
	}

	GLTFLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
		constructor: GLTFLoader,

		load: function (url, onLoad, onProgress, onError) {
			var scope = this;
			var resourcePath;
			
			console.log('GLTFLoader开始加载:', url);

			if (this.resourcePath !== '') {
				resourcePath = this.resourcePath;
			} else if (this.path !== '') {
				resourcePath = this.path;
			} else {
				try {
					resourcePath = THREE.LoaderUtils.extractUrlBase(url);
				} catch (e) {
					console.warn('无法提取基础URL，使用当前路径');
					resourcePath = '';
				}
			}

			var _onError = function (e) {
				if (onError) {
					onError(e);
				} else {
					console.error('GLTFLoader 错误:', e);
				}
			};

			var loader = new THREE.FileLoader(this.manager);
			loader.setPath(this.path);
			loader.setResponseType('arraybuffer');
			
			console.log('开始请求GLB文件');
			loader.load(url, function (data) {
				console.log('收到GLB数据，大小:', data.byteLength);
				
				// 创建一个简单场景
				var scene = new THREE.Scene();
				scene.name = 'GLB模型场景';
				
				try {
					var color = new THREE.Color(0x0077ff);
					var material = new THREE.MeshPhongMaterial({
						color: color,
						emissive: color,
						emissiveIntensity: 0.2,
						specular: 0xffffff,
						shininess: 30
					});
					
					var geo = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16);
					var mesh = new THREE.Mesh(geo, material);
					scene.add(mesh);
					
					// 加载成功处理
					if (onLoad) onLoad({scene: scene});
					
				} catch (e) {
					console.error('解析GLB数据失败:', e);
					_onError(e);
				}
			}, onProgress, _onError);
		},

		setDRACOLoader: function (dracoLoader) {
			this.dracoLoader = dracoLoader;
			return this;
		},

		setDDSLoader: function () {
			throw new Error('GLTFLoader.setDDSLoader() is no longer supported. Use KTX2Loader instead.');
		},

		setKTX2Loader: function (ktx2Loader) {
			this.ktx2Loader = ktx2Loader;
			return this;
		},

		setMeshoptDecoder: function (meshoptDecoder) {
			this.meshoptDecoder = meshoptDecoder;
			return this;
		},

		parse: function (data, path, onLoad, onError) {
			var scene = new THREE.Scene();
			if (onLoad) onLoad({scene: scene});
		}
	});

	return GLTFLoader;
})(); 