Phaser.Filter.White = function (game) {
  Phaser.Filter.call(this, game)

  this.fragmentSrc = [

    'precision mediump float;',

    'varying vec2       vTextureCoord;',
    'varying vec4       vColor;',
    'uniform sampler2D  uSampler;',
    'uniform float      white;',

    'void main(void) {',
    'gl_FragColor = texture2D(uSampler, vTextureCoord);',
    'gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1), gl_FragColor.a);',
    '}'
  ]
}

Phaser.Filter.White.prototype = Object.create(Phaser.Filter.prototype)
Phaser.Filter.White.prototype.constructor = Phaser.Filter.White

Object.defineProperty(Phaser.Filter.White.prototype, 'white', {
  get: function () {
    return this.uniforms.white.value
  },

  set: function (value) {
    this.uniforms.white.value = value
  }

})
