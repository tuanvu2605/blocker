function webgl_support() {
    try {
        var e = document.createElement("canvas");
        return !!window.WebGLRenderingContext && (e.getContext("webgl") || e.getContext("experimental-webgl"))
    } catch (e) {
        return !1
    }
}

function ping(e) {
    var a = new WebSocket(Server.getHost(e.value));
    a.binaryType = "arraybuffer";
    var t;
    a.onmessage = function(o) {
        var s = Date.now();
        t = Math.floor((s - t) / 2), e.ping || (e.ping = t, e.innerHTML = e.name + "&emsp;(" + (t > 1e3 ? (t / 1e3).toFixed(2) + " s)" : t + " ms)"), t = Date.now()), a.onclose = function() {}, a.close()
    }, a.onclose = function(a) {
        e.name = e.name + " ( - )"
    }, a.onopen = function(e) {
        t = Date.now(), a.send(Event.PING)
    }
}

function resumeGame() {
    body.contains(loader) && (body.remove(loader), body.remove(reloader)), ui.current.mute.on && (game.sound.mute = !1), ui.join()
}

function pauseGame() {
    game.sound.mute = !0
}

function initGDApi() {
    ! function(e, a, t, o, s, n, i) {
        e.GameDistribution = s, e[s] = e[s] || function() {
            (e[s].q = e[s].q || []).push(arguments)
        }, e[s].l = 1 * new Date, n = a.createElement(t), i = a.getElementsByTagName(t)[0], n.async = 1, n.src = "//html5.api.gamedistribution.com/libs/gd/api.js", i.parentNode.insertBefore(n, i)
    }(window, document, "script", 0, "gdApi");
    var e = {
        gameId: "df8c92ee1900430c951f24f0f6d536cf",
        userId: "82966E46-4995-4BD6-B432-411FE032C08A-s1",
        resumeGame: resumeGame,
        pauseGame: pauseGame,
        onInit: function(e) {},
        onError: function(e) {
            console.log("Error:" + e)
        }
    };
    gdApi(e)
}

function startAds() {
    loader.style.zIndex = 100, body.append(loader), reloader.style.zIndex = 101, body.append(reloader), game.sound.mute = !0, ui.ads.time = Date.now(), initGDApi()
}

function uuid() {
    var e = function() {
        return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
    }();
    return creatures[e] ? uuid() : e
}

function round(e, a) {
    return Number(Math.round(e + "e" + a) + "e-" + a)
}

function encode(e, a) {
    return a = a ? e + JSON.stringify(a) : e
}

function decode(e) {
    return JSON.parse(e)
}

function decodeHard(e) {
    return JSON.parse(pako.inflate(e, {
        to: "string"
    }))
}

function send(e, a) {
    ws.send(encode(e, a))
}

function ab2str(e) {
    return String.fromCharCode.apply(null, new Uint8Array(e))
}

function client() {
    ws.onmessage = function(e) {
        var a = ab2str(e.data),
            t = Number(a.charAt(0)),
            o = a.substring(1);
        switch (t) {
            case 2:
                o = decodeHard(o), map.init(o), last.update = Date.now();
                break;
            case 3:
                map.play(decode(o));
                break;
            case 4:
                o = decodeHard(o), ui.quest.defend.style.display = "none", ui.quest.outpost.style.display = "none", ui.quest.flag.style.display = "none", o.leaders && ui.score.innerHTML != o.leaders && (ui.score.innerHTML = o.leaders), map.update(o.data), night.update(o.night < 0), daynight && (daynight.tilePosition.x = o.night / 10), map.season = o.season, last.update = Date.now();
                break;
            case 7:
                if (o = decode(o), ui.shop.data == ui.shop.items[o.success].data && (ui.shop.buy.className = "bought", ui.shop.buy.textContent = "Owned", ui.shop.buy.disabled = !0, new Sound("bought"), "usable.potion" != o.success)) {
                    var s = o.success.split(".");
                    player.items[s[0]] = s[1]
                }
        }
    }, ws.onopen = function(e) {
        send(Event.LOAD), console.log("Connected")
    }, ws.onerror = function(e) {
        ws.close();
        for (var a = Server.getZone(); a == server;) a = Server.getZone();
        localStorage.setItem("serv", a), isTest || ui.reload()
    }, ws.onclose = function(e) {
        isTest || ui.reload()
    }
}

function start() {
    ws = new WebSocket(Server.getHost(server)), ws.binaryType = "arraybuffer", init(), client(), ui.current.server.value = server
}

function create() {
    canvas = document.getElementsByTagName("canvas")[0], game.input.mouse.capture = !0, game.stage.disableVisibilityChange = !1, game.stage.backgroundColor = "#" + decimalToHexString(Game.seasons.spring.color), game.world.setBounds(0, 0, Game.size, Game.size), game.input.addPointer(), game.input.addPointer(), game.input.addPointer(), game.input.maxPointers = 3, initWeather(), grass = game.add.graphics(0, 0), grass.bounds = new PIXI.Rectangle(0, 0, Game.size, Game.size), game.camera.x = Math.random() * Game.size, game.camera.y = Math.random() * Game.size, game.scale.refresh(), created = !0;
    var e = game.add.audio("bgm");
    e.loop = !0, e.volume = .1, e.play(), localStorage.getItem("muted") && ui.current.mute.click(), white = game.add.filter("White"), start()
}

function update() {
    function e() {
        send(Event.MOVE, {
            r: round(o, 4),
            t: round(s, 4)
        }), last.move = t
    }

    function a(e) {
        return game.input.keyboard.isDown(e)
    }
    if (map.ready) {
        var t = Date.now();
        if (player) {
            var o = null,
                s = Control.playerRotation();
            if (last.turn < t - 100 && (new Tween(player.weapon, player.id + "w", {
                    rotation: player.rotation
                }, !0), last.turn = t), isDesktop) ui.text.toggle || (a(Phaser.Keyboard.W) && a(Phaser.Keyboard.A) ? o = .25 * Math.PI : a(Phaser.Keyboard.W) && a(Phaser.Keyboard.D) ? o = .75 * Math.PI : a(Phaser.Keyboard.S) && a(Phaser.Keyboard.A) ? o = -.25 * Math.PI : a(Phaser.Keyboard.S) && a(Phaser.Keyboard.D) ? o = -.75 * Math.PI : a(Phaser.Keyboard.A) ? o = 1e-4 : a(Phaser.Keyboard.D) ? o = Math.PI : a(Phaser.Keyboard.W) ? o = .5 * Math.PI : a(Phaser.Keyboard.S) && (o = -.5 * Math.PI), player.status.stun || (player.rotation = s)), o && !player.shopping && !player.questing && last.move < t - 100 && e(), (game.input.activePointer.isDown && !last.shopOn && !last.questOn || a(Phaser.Keyboard.SPACEBAR) && !ui.text.toggle) && last.attack < t - 300 && (send(Event.ATTACK, {
                r: round(s, 4)
            }), last.attack = t), game.input.keyboard.isDown(Phaser.Keyboard.ENTER) && last.enter < t - 200 && ui.text.enter();
            else if (!o) {
                if (game.input.pointer1.isDown || game.input.pointer2.isDown) {
                    s = null;
                    var n = window.innerWidth >= 1024 ? 1 : 1.25;
                    game.input.pointer1.x < window.innerWidth / 2 * n ? (touch.move.show(game.input.pointer1), o = Control.controllerRotation(game.input.pointer1), game.input.pointer2.isDown && game.input.pointer2.x > window.innerWidth / 2 * n && (touch.attack.show(game.input.pointer2), s = Control.attackerRotation(game.input.pointer2))) : game.input.pointer1.x > window.innerWidth / 2 * n && (touch.attack.show(game.input.pointer1), s = Control.attackerRotation(game.input.pointer1), game.input.pointer2.isDown && game.input.pointer2.x < window.innerWidth / 2 * n && (touch.move.show(game.input.pointer2), o = Control.controllerRotation(game.input.pointer2))), last.move < t - 100 && (s && last.attack < t - 300 && (player.rotation = s, send(Event.ATTACK, {
                        r: round(s, 4)
                    }), last.attack = t), o && e())
                }
                touch.move.button && touch.move.button.isUp && touch.move.hide(), touch.attack.button && touch.attack.button.isUp && touch.attack.hide()
            }
        } else game.camera.spectatee ? (game.camera.x += -(game.camera.x - game.camera.spectatee.x) - game.width / 2, game.camera.y += -(game.camera.y - game.camera.spectatee.y) - game.height / 2) : last.panning ? (game.camera.x <= 0 ? last.panning.dx = 1 : game.camera.x >= Game.size - window.innerWidth && (last.panning.dx = -1), game.camera.y <= 0 ? last.panning.dy = 1 : game.camera.y >= Game.size - window.innerHeight && (last.panning.dy = -1), last.panning.time % 3 == 0 && (game.camera.x += last.panning.dx, game.camera.y += last.panning.dy), --last.panning.time <= 0 && delete last.panning) : last.panning = {
            dx: Math.random() > .5 ? -1 : 1,
            dy: Math.random() > .5 ? -1 : 1,
            time: 500 + Math.floor(1e3 * Math.random())
        };
        for (var i in tweens) tweens[i].update();
        water && (water.tilePosition.x += .1, water.tilePosition.y += .2), last.update < t - Game.timeout && !isTest && (ws.close(), ui.reload(), last.update = t + Game.timeout), last.LOD < t - 150 && (Terrain.updateLOD(), last.LOD = t), weather(), night.x = game.camera.x - 10, night.y = game.camera.y - 10;
        for (var i in temp.dynamic.actives) {
            var r = temp.dynamic.actives[i];
            if (r.target) {
                var d = creatures[r.target];
                d && d.shadow && (r.x = d.x + d.shadow.spread, r.y = d.y + d.shadow.spread, r.visible = !0)
            }
        }
    }
    map.running = !0
}

function render() {}

function init() {
    soils = game.add.group(), isDesktop && (bg = game.add.tileSprite(0, 0, Game.size, Game.size, "bg"), soils.add(bg), waterGraphics = game.add.graphics(0, 0), waterGraphics.bounds = new PIXI.Rectangle(0, 0, Game.size, Game.size), waterMask = game.add.graphics(0, 0), waterMask.beginFill(0, 0), waterMask.bounds = new PIXI.Rectangle(0, 0, Game.size, Game.size), water = game.add.tileSprite(0, 0, Game.size, Game.size, "water"), water.alpha = .5, water.mask = waterMask), zones = game.add.group(), shots = game.add.group(), rides = game.add.group(), weapons = game.add.group(), shadows = game.add.group(), plants = game.add.group(), zombies = game.add.group(), heroes = game.add.group(), fruits = game.add.group(), names = game.add.group(), shadows2 = game.add.group(), rocks = game.add.group(), trees = game.add.group(), shadows3 = game.add.group(), towers = game.add.group(), bosses = game.add.group(), effects = game.add.group(), night = new Night, radar = game.add.graphics(0, 0), radar.bounds = new PIXI.Rectangle(0, 0, game.width, game.height), isDesktop && (daynight = new Daynight), radar.visible = !1, radar.fixedToCamera = !0, Terrain.initTemp(), legend.flags = {
        A: new RadarFlag("A"),
        B: new RadarFlag("B"),
        C: new RadarFlag("C"),
        D: new RadarFlag("D")
    }
}

function waterStep(e, a, t) {
    !isDesktop || e.ripple || e.lastStep.x == a.x && e.lastStep.y == a.y || checkMask(e, function() {
        new Ripple(e, a.x, a.y, waterMask, t)
    }), e.lastStep = {
        x: a.x,
        y: a.y
    }
}

function clear(e) {
    if (e)
        for (; e.firstChild;) e.removeChild(e.firstChild)
}

function nameDOM(e, a) {
    a.childNodes.length > 0 && a.childNodes.forEach(function(a) {
        if (-1 == a.nodeName.indexOf("#")) {
            var t = a.getAttribute("*");
            t && (e[t] = a), nameDOM(e, a)
        }
    }, this)
}

function createDOM(e) {
    var a = parser.parseFromString(e, "text/html").firstChild.childNodes[1].firstChild;
    return nameDOM(a, a), a
}

function get(e) {
    return document.getElementById(e)
}

function pointToPoint(e, a) {
    return Math.atan2(e.y - a.y, e.x - a.x)
}

function pointToRadian(e, a, t, o) {
    return Math.atan2(a - o, e - t)
}

function lineIntersect(e, a, t, o, s, n, i, r) {
    var d, l, c = (r - n) * (t - e) - (i - s) * (o - a);
    return 0 == c ? null : (d = ((i - s) * (a - n) - (r - n) * (e - s)) / c, l = ((t - e) * (a - n) - (o - a) * (e - s)) / c, {
        x: e + d * (t - e),
        y: a + d * (o - a),
        seg1: d >= 0 && d <= 1,
        seg2: l >= 0 && d <= 1
    })
}

function distance(e, a, t, o) {
    var s = e - t,
        n = a - o;
    return Math.sqrt(s * s + n * n)
}

function multiplier() {
    return Math.random() < .5 ? -1 : 1
}

function nextTick(e) {
    setTimeout(e, 1)
}

function randomJSON(e) {
    var a = Object.keys(e);
    return e[a[a.length * Math.random() << 0]]
}

function checkVisible(e, a, t) {
    return e > game.camera.x - t && a > game.camera.y - t && e < game.camera.x + game.width + t && a < game.camera.y + game.height + t
}

function checkMask(e, a, t) {
    if (checkVisible(e.x, e.y, 60))
        for (var o in waters) {
            var s = waters[o];
            if (e.x > s.x && e.x < s.x + s.width && e.y > s.y && e.y < s.y + s.height) {
                a();
                break
            }
        }
}

function checkTween(e, a, t, o) {
    checkVisible(e.x, e.y, 60) ? (e.visible || (e.visible = !0, e.shadowImage && (e.shadowImage.visible = !0), e.weapon && (e.weapon.visible = !0), e.name && (e.name.visible = !0), e.text && (e.text.visible = !0), e.coin && e.coinScore > 0 && e.coinIcon && (e.coin.visible = !0, e.coinIcon.visible = !0), e.bar && (e.bar.visible = !0, e.barBg.visible = !0), e.fashion && (e.fashion.visible = !0)), e.shadow && Terrain.randomTempShadow(e), t && t()) : (a && (e.x = a.x, e.y = a.y, e.shadowImage && (e.shadowImage.visible = !1), e.weapon && (e.weapon.x = a.x, e.weapon.y = a.y, e.weapon.visible = !1), e.name && (e.name.visible = !1), e.text && (e.text.visible = !1), e.coin && e.coinIcon && (e.coin.visible = !1, e.coinIcon.visible = !1), e.bar && (e.bar.visible = !1, e.barBg.visible = !1), e.fashion && (e.fashion.visible = !1)), e.visible = !1, o && o())
}

function radarUpdate(e, a, t, o) {
    function s(t, o) {
        t && (e = t.x, a = t.y, o && (e += o, a += o))
    }
    if (radar.target) {
        var n = game.camera.x,
            i = game.camera.y,
            r = radar.target.x - n,
            d = radar.target.y - i,
            l = pointToRadian(radar.target.x, radar.target.y, e, a),
            c = Math.cos(l) * (Game.size / 2),
            u = Math.sin(l) * (Game.size / 2);
        e = r - c, a = d - u;
        var m = t,
            p = m / 2;
        e < m ? s(lineIntersect(0, 0, 0, game.height, r, d, e, a), m) : e > game.width && s(lineIntersect(game.width, 0, game.width, game.height, r, d, e, a)), a < m ? s(lineIntersect(0, 0, game.width, 0, r, d, e, a), m) : a > game.height && s(lineIntersect(0, game.height, game.width, game.height, r, d, e, a)), o(e, a, m, p)
    }
}

function shadow(e, a, t, o) {
    e.shadow = {
        scale: a.shadow.scale,
        spread: a.shadow.spread
    }, e.shadowImage = t.create(a.x - e.radius + a.shadow.spread, a.y - e.radius + a.shadow.spread, o), e.shadowImage.scale.set(a.shadow.scale)
}

function terrainGrid(e) {
    var a = Math.floor(e.x / Game.grid) + "," + Math.floor(e.y / Game.grid);
    terrains[a] || (terrains[a] = {}), terrains[a][e.id] = e
}

function preload() {
    function e(e, a) {
        var t = game.add.graphics(0, 0);
        t.beginFill(e, 1), t.drawRect(0, 0, a, a), t.endFill();
        var o = t.generateTexture();
        return t.destroy(), o
    }
    ui.start(), isDesktop = game.device.desktop, Game.framerate = isDesktop ? 10 : 6, game.load.maxParallelDownloads = isDesktop ? 100 : 16, sprites.night = e(138, 1), sprites.flake = e(16777215, 3), sprites.flare = e(16763904, 3), sprites.flame = e(16750848, 12), sprites.flame1 = e(16750848, 8), sprites.flame2 = e(16750848, 8), sprites.flame3 = e(16750848, 3), sprites.snow = e(15596026, 3), sprites.frost = e(6738175, 8), sprites.poison = e(10933540, 8), sprites.heal = e(16738702, 3), sprites.black = e(0, 2), sprites.white = e(16777215, 2), sprites.fade = e(5592405, 1), sprites.speed = e(65535, 1), sprites.eater = e(65344, 1), sprites.reflect = e(16776960, 1), sprites.evil = e(16736183, 8), game.load.image("bg", "assets/env/bg.svg"), game.load.image("tree", "assets/env/tree.svg"), game.load.image("bush", "assets/env/bush.svg"), game.load.image("shadow", "assets/env/shadow.svg"), game.load.image("shadow2", "assets/env/shadow2.svg"), game.load.image("shadow3", "assets/env/shadow3.svg"), game.load.spritesheet("rock", "assets/env/rock.svg", 40, 40), game.load.image("fruit", "assets/env/fruit.svg"), game.load.image("soil", "assets/env/soil.svg"), game.load.image("water", "assets/env/water.svg"), game.load.spritesheet("tower", "assets/env/tower.svg", 80, 80), game.load.spritesheet("house", "assets/env/house.svg", 80, 80), game.load.image("move", "assets/ui/move.svg"), game.load.image("attack", "assets/ui/attack.svg"), game.load.image("bubble", "assets/ui/bubble.svg"), game.load.image("skull", "assets/ui/skull.svg"), game.load.image("armor", "assets/ui/armor.svg"), game.load.image("coin", "assets/ui/coin.svg"), game.load.image("daynight", "assets/ui/daynight/daynight.svg"), game.load.image("daynight.mask", "assets/ui/daynight/daynight.mask.svg"), game.load.image("light", "assets/fx/light.svg"), game.load.image("smoke", "assets/fx/smoke.svg"), game.load.image("bone", "assets/fx/bone.svg"), game.load.image("heart", "assets/fx/heart.svg"), game.load.image("shop", "assets/fx/shop.svg"), game.load.image("quest", "assets/fx/quest.svg"), game.load.image("stun", "assets/fx/stun.svg"), game.load.image("revive", "assets/fx/revive.svg"), game.load.image("text.revive", "assets/fx/text.revive.svg"), game.load.image("text.block", "assets/fx/text.block.svg"), game.load.image("soul", "assets/fx/soul.svg"), game.load.image("potion", "assets/items/potion.svg"), game.load.image("box", "assets/items/box.svg"), game.load.image("treasure", "assets/items/treasure.svg"), game.load.image("claw", "assets/items/claw.svg"), game.load.image("core", "assets/items/core.svg"), game.load.image("campfire", "assets/items/campfire.svg"), game.load.image("crystal.blue", "assets/items/crystal.blue.svg"), game.load.image("crystal.green", "assets/items/crystal.green.svg"), game.load.image("crystal.yellow", "assets/items/crystal.yellow.svg"), game.load.spritesheet("magneto", "assets/items/magneto.svg", 46, 46), game.load.image("fashion.wolf", "assets/fashion/wolf.svg"), game.load.image("fashion.bunny", "assets/fashion/bunny.svg"), game.load.image("fashion.piggy", "assets/fashion/piggy.svg"), game.load.image("fashion.froggy", "assets/fashion/froggy.svg"), game.load.image("fashion.skull", "assets/fashion/skull.svg"), game.load.image("fashion.batman", "assets/fashion/batman.svg"), game.load.image("fashion.nyancat", "assets/fashion/nyancat.svg"), game.load.image("fashion.dragonic", "assets/fashion/dragonic.svg"), game.load.image("zombie", "assets/monsters/zombie.svg"), game.load.image("zombie.A", "assets/monsters/zombie.A.svg"), game.load.image("zombie.B", "assets/monsters/zombie.B.svg"), game.load.image("zombie.C", "assets/monsters/zombie.C.svg"), game.load.image("zombie.D", "assets/monsters/zombie.D.svg"), game.load.spritesheet("zombie.body", "assets/monsters/body/zombie.body.svg", 160, 160), game.load.spritesheet("zombie.body.A", "assets/monsters/body/zombie.body.A.svg", 160, 160), game.load.spritesheet("zombie.body.B", "assets/monsters/body/zombie.body.B.svg", 160, 160), game.load.spritesheet("zombie.body.C", "assets/monsters/body/zombie.body.C.svg", 160, 160), game.load.spritesheet("zombie.body.D", "assets/monsters/body/zombie.body.D.svg", 160, 160), game.load.image("bat", "assets/monsters/bat.svg"), game.load.spritesheet("bat.body", "assets/monsters/body/bat.body.svg", 160, 160), game.load.image("pig", "assets/monsters/pig.svg"), game.load.image("turret", "assets/monsters/turret.svg"), game.load.image("spike", "assets/monsters/spike.svg"), game.load.image("skeleton", "assets/monsters/skeleton.svg"), game.load.spritesheet("skeleton.body", "assets/monsters/body/skeleton.body.svg", 160, 160), game.load.image("ostrich", "assets/monsters/ostrich.svg"), game.load.spritesheet("ostrich.body", "assets/monsters/body/ostrich.body.svg", 160, 160), game.load.image("reaper", "assets/monsters/reaper.svg"), game.load.spritesheet("reaper.body", "assets/monsters/body/reaper.body.svg", 160, 160), game.load.image("slime", "assets/monsters/slime.svg"), game.load.image("wolf", "assets/monsters/wolf.svg"), game.load.spritesheet("wolf.body", "assets/monsters/body/wolf.body.svg", 160, 160), game.load.image("yeti", "assets/monsters/yeti.svg"), game.load.spritesheet("yeti.body", "assets/monsters/body/yeti.body.svg", 160, 160), game.load.image("cactus", "assets/monsters/cactus.svg"), game.load.spritesheet("cactus.body", "assets/monsters/body/cactus.body.svg", 160, 160), game.load.image("scorpion", "assets/monsters/scorpion.svg"), game.load.spritesheet("scorpion.body", "assets/monsters/body/scorpion.body.svg", 160, 160), game.load.image("dragon", "assets/monsters/dragon.svg"), game.load.spritesheet("dragon.body", "assets/monsters/body/dragon.body.svg", 160, 160);
    for (var a in Game.jobs) {
        var t = Game.jobs[a],
            o = "viking" == t ? 80 : 46;
        game.load.image(t + ".A", "assets/A/" + t + ".svg", o, o), game.load.image(t + ".B", "assets/B/" + t + ".svg", o, o), game.load.image(t + ".C", "assets/C/" + t + ".svg", o, o), game.load.image(t + ".D", "assets/D/" + t + ".svg", o, o)
    }
    for (var a in Game.jobWeapon) game.load.spritesheet(Game.jobWeapon[a], "assets/weapons/" + Game.jobWeapon[a] + ".svg", 160, 160);
    if (game.load.image("flag.A", "assets/A/flag.svg"), game.load.image("flag.B", "assets/B/flag.svg"), game.load.image("flag.C", "assets/C/flag.svg"), game.load.image("flag.D", "assets/D/flag.svg"), game.load.image("radar.A", "assets/ui/flags/A.svg"), game.load.image("radar.B", "assets/ui/flags/B.svg"), game.load.image("radar.C", "assets/ui/flags/C.svg"), game.load.image("radar.D", "assets/ui/flags/D.svg"), game.load.image("legend.tower", "assets/ui/legends/tower.svg"), game.load.image("arrow", "assets/weapons/arrow.svg"), game.load.image("blade", "assets/weapons/blade.svg"), game.load.image("blade.shadow", "assets/weapons/blade.shadow.svg"), game.load.image("bomb", "assets/weapons/bomb.svg"), game.load.image("bomb.shadow", "assets/weapons/bomb.shadow.svg"), game.load.image("npc.male", "assets/npc/male.svg"), game.load.image("npc.female", "assets/npc/female.svg"), game.load.image("father", "assets/npc/father.svg"), game.load.spritesheet("npc.body", "assets/npc/body.svg", 160, 160), game.load.image("princess", "assets/npc/princess.svg"), game.load.spritesheet("princess.body", "assets/npc/princess.body.svg", 160, 160), isDesktop) {
        game.load.audio("bgm", "assets/audio/bgm.ogg"), game.load.audio("hit.player1", "assets/audio/hit/player1.ogg"), game.load.audio("hit.player2", "assets/audio/hit/player2.ogg"), game.load.audio("hit.player3", "assets/audio/hit/player3.ogg"), game.load.audio("hit.zombie1", "assets/audio/hit/zombie1.ogg"), game.load.audio("hit.zombie2", "assets/audio/hit/zombie2.ogg"), game.load.audio("hit.zombie3", "assets/audio/hit/zombie3.ogg"), game.load.audio("hit.skeleton1", "assets/audio/hit/skeleton1.ogg"), game.load.audio("hit.skeleton2", "assets/audio/hit/skeleton2.ogg"), game.load.audio("hit.skeleton3", "assets/audio/hit/skeleton3.ogg"), game.load.audio("hit.bat1", "assets/audio/hit/bat1.ogg"), game.load.audio("hit.bat2", "assets/audio/hit/bat2.ogg"), game.load.audio("hit.dragon", "assets/audio/hit/dragon.ogg"), game.load.audio("hit.pig1", "assets/audio/hit/pig1.ogg"), game.load.audio("hit.pig2", "assets/audio/hit/pig2.ogg"), game.load.audio("hit.slime", "assets/audio/hit/slime.ogg"), game.load.audio("hit.wolf1", "assets/audio/hit/wolf1.ogg"), game.load.audio("hit.wolf2", "assets/audio/hit/wolf2.ogg"), game.load.audio("hit.reaper1", "assets/audio/hit/reaper1.ogg"), game.load.audio("hit.reaper2", "assets/audio/hit/reaper2.ogg");
        for (var a in Game.jobs) {
            var t = Game.jobs[a];
            game.load.audio("attack." + t, "assets/audio/attack/" + t + ".ogg")
        }
        game.load.audio("attack.zombie1", "assets/audio/attack/zombie1.ogg"), game.load.audio("attack.zombie2", "assets/audio/attack/zombie2.ogg"), game.load.audio("attack.bat", "assets/audio/attack/bat.ogg"), game.load.audio("attack.wolf1", "assets/audio/attack/wolf1.ogg"), game.load.audio("attack.wolf2", "assets/audio/attack/wolf2.ogg"), game.load.audio("dragon.dead", "assets/audio/dragon/dead.ogg"), game.load.audio("dragon.blast", "assets/audio/dragon/blast.ogg"), game.load.audio("bomb", "assets/audio/effect/bomb.ogg"), game.load.audio("heal", "assets/audio/effect/heal.ogg"), game.load.audio("stun", "assets/audio/effect/stun.ogg"), game.load.audio("reflect", "assets/audio/effect/reflect.ogg"), game.load.audio("glass1", "assets/audio/effect/glass1.ogg"), game.load.audio("glass2", "assets/audio/effect/glass2.ogg"), game.load.audio("glass3", "assets/audio/effect/glass3.ogg"), game.load.audio("capture", "assets/audio/capture.ogg"), game.load.audio("close", "assets/audio/close.ogg"), game.load.audio("coin", "assets/audio/coin.ogg"), game.load.audio("destroy", "assets/audio/destroy.ogg"), game.load.audio("shop", "assets/audio/shop.ogg"), game.load.audio("tower", "assets/audio/tower.ogg"), game.load.audio("bought", "assets/audio/bought.ogg"), game.load.audio("block", "assets/audio/block.ogg"), game.load.audio("revive", "assets/audio/revive.ogg"), game.load.audio("text1", "assets/audio/text/yes1.ogg"), game.load.audio("text2", "assets/audio/text/yes2.ogg"), game.load.audio("text3", "assets/audio/text/yes3.ogg"), game.load.audio("text4", "assets/audio/text/idle1.ogg"), game.load.audio("text5", "assets/audio/text/idle2.ogg"), game.load.audio("text6", "assets/audio/text/idle3.ogg"), game.load.audio("step1", "assets/audio/step/cloth1.ogg"), game.load.audio("step2", "assets/audio/step/cloth2.ogg"), game.load.audio("step3", "assets/audio/step/cloth3.ogg"), game.load.audio("step4", "assets/audio/step/cloth4.ogg"), game.load.audio("water1", "assets/audio/water/gravel1.ogg"), game.load.audio("water2", "assets/audio/water/gravel2.ogg"), game.load.audio("water3", "assets/audio/water/gravel3.ogg"), game.load.audio("water4", "assets/audio/water/gravel4.ogg"), game.load.audio("water5", "assets/audio/water/gravel5.ogg"), ui.current.left.append(ui.current.mute)
    } else ui.current.left.append(ui.current.reload);
    game.load.script("white", "assets/shaders/white.js"), game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL, game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL, game.scale.pageAlignHorizontally = !0, game.scale.pageAlignVertically = !0, game.scale.setResizeCallback(function() {
        ui.current && resizeUI()
    })
}

function playSound(e) {
    var a = game.add.audio(e);
    return a.play(), a
}

function mobileUI() {
    isDesktop || (button.move ? (button.move.style.display = "none", button.attack.style.display = "none", button.moveStick.style.display = "none", button.attackStick.style.display = "none") : (button.move = createDOM('<div class="button-move"></div>'), button.attack = createDOM('<div class="button-attack"></div>'), button.moveStick = createDOM('<div class="button-stick"></div>'), button.attackStick = createDOM('<div class="button-stick"></div>'), body.append(button.move), body.append(button.attack), body.append(button.moveStick), body.append(button.attackStick))), body.append(ui.text.bubble), body.append(ui.text), body.append(ui.stat), body.append(ui.score), body.append(ui.quest)
}

function resizeUI() {
    isDesktop ? (ui.landscape.style.display = "none", game.scale.setGameSize(window.innerWidth, window.innerHeight), game.scale.setUserScale(1, 1, 0, 0)) : (window.orientation ? 90 == window.orientation || -90 == window.orientation ? ui.landscape.style.display = "none" : ui.landscape.style.display = "block" : ui.landscape.style.display = "none", isTest && (ui.landscape.style.display = "none"), window.innerWidth < 1024 && (game.scale.setGameSize(1.25 * window.innerWidth, 1.25 * window.innerHeight), game.scale.setUserScale(10, 10, 0, 0))), night && (night.x = game.camera.x - 10, night.y = game.camera.y - 10, night.width = game.width + 20, night.height = game.height + 20), Game.weather && (Game.weather.x = game.camera.x, Game.weather.y = game.camera.y);
    ui.current.style.left = window.innerWidth / 2 - 268 + 5 + "px", ui.current.style.top = window.innerHeight / 2 - 153 - 10 + "px", ui.text.style.left = window.innerWidth / 2 - ui.text.offsetWidth / 2 + "px"
}

function weather() {
    Game.season != map.season && (Game.seasons[map.season].update(), Game.season = map.season), isDesktop && "winter" == Game.season && !Game.weather ? (Game.weather = game.add.emitter(0, 0, 400), Game.weather.width = game.world.width, Game.weather.makeParticles(sprites.snow), Game.weather.minParticleScale = .5, Game.weather.maxParticleScale = 1, Game.weather.setYSpeed(0), Game.weather.setXSpeed(-150, 150), Game.weather.minRotation = 0, Game.weather.maxRotation = 360, Game.weather.start(!1, 5e3, 50, 0), effects.add(Game.weather)) : "winter" != Game.season && Game.weather && (effects.remove(Game.weather), Game.weather.destroy(), Game.weather = null)
}

function tweenTint(e, a, t, o) {
    var s = {
            step: 0
        },
        n = game.add.tween(s).to({
            step: 100
        }, o);
    n.onUpdateCallback(function() {
        e.tint = Phaser.Color.interpolateColor(a, t, 100, s.step)
    }), e.tint = a, n.start()
}

function decimalToHexString(e) {
    return e < 0 && (e = 16777215 + e + 1), e.toString(16).toUpperCase()
}

function tweenColor(e, a, t, o) {
    var s = {
            step: 0
        },
        n = game.add.tween(s).to({
            step: 100
        }, o);
    n.onUpdateCallback(function() {
        var o = Phaser.Color.interpolateColor(a, t, 100, s.step);
        e(decimalToHexString(o))
    }), n.start()
}

function tweenHSL(e, a, t, o, s) {
    e.loadTexture(o);
    var n = a.create(e.x, e.y, t);
    n.scale.set(e.size), n.anchor.set(.5), n.rotation = e.rotation, game.add.tween(n).to({
        alpha: 0
    }, s, Phaser.Easing.None, !0).onComplete.add(function() {
        n.destroy()
    }, this)
}

function initWeather() {
    var e = game.make.bitmapData();
    e.load("tree");
    var a = game.make.bitmapData();
    a.load("bush"), game.cache.addBitmapData("tree", e), game.cache.addBitmapData("bush", a), Game.seasons.spring.tree = game.cache.getBitmapData("tree"), Game.seasons.spring.bush = game.cache.getBitmapData("bush");
    var t = game.make.bitmapData();
    t.load("tree");
    var o = game.make.bitmapData();
    o.load("bush"), t.shiftHSL(.19), o.shiftHSL(.1), game.cache.addBitmapData("tree2", t), game.cache.addBitmapData("bush2", o), Game.seasons.winter.tree = game.cache.getBitmapData("tree2"), Game.seasons.winter.bush = game.cache.getBitmapData("bush2");
    var s = game.make.bitmapData();
    s.load("tree");
    var n = game.make.bitmapData();
    n.load("bush"), s.shiftHSL(.9), n.shiftHSL(.81), game.cache.addBitmapData("tree3", s), game.cache.addBitmapData("bush3", n), Game.seasons.autumn.tree = game.cache.getBitmapData("tree3"), Game.seasons.autumn.bush = game.cache.getBitmapData("bush3")
}

function startRender() {
    webgl_support() ? game = new Phaser.Game("100%", "100%", Phaser.WEBGL, "Blocker", {
        preload: preload,
        create: create,
        update: update
    }, !1, !1) : body.innerHTML += '<div class="error" style=""></div>'
}
Event = {}, Event.PING = 0, Event.PONG = 1, Event.LOAD = 2, Event.JOIN = 3, Event.MOVE = 4, Event.ATTACK = 5, Event.TEXT = 6, Event.BUY = 7;
var body = document.body || document.documentElement,
    isDesktop = !window.orientation,
    isTest = !1;
"localhost" == location.hostname && (isTest = "ws://localhost:8000/ws");
var game, Game = {
        size: 7980,
        grid: 80,
        framerate: 10,
        timeout: 6e4,
        spectate: !1
    },
    sprites = {};
Game.team = ["A", "B", "C", "D"], Game.jobs = ["warrior", "ranger", "mage", "doctor", "shinobi", "basher", "bomber", "necromancer", "bandit", "scientist", "druid", "builder", "viking", "spikey"], Game.jobWeapon = {
    warrior: "sword",
    ranger: "bow",
    mage: "cloak",
    doctor: "bag",
    shinobi: "blader",
    basher: "hammer",
    bomber: "bag2",
    necromancer: "rod",
    bandit: "dagger",
    scientist: "bag3",
    druid: "rod2",
    builder: "bag4",
    viking: "axe",
    spikey: "bag3"
}, Game.jobDesc = {
    warrior: ["warrior", "Sword", "Fastest closed-combat weapon.", "Radius Effect", "Does damage to enemies in the radius of effect."],
    ranger: ["ranger", "Bow", "Powerful weapon for ranged-combat.", "Hawk Eye", "Shoots an arrow with the farthest range at an enemy."],
    mage: ["mage", "Cold Power", "Great power of ice element.", "Frost", "Does damage and slows an enemy for 2 sec."],
    doctor: ["doctor", "Potion", "Useful item for healing an ally.", "Poison Effect", "Does damage to an enemy who drinks the potion."],
    shinobi: ["ninja", "Shuriken", "Killing-weapon from the ninja clan.", "Rebound", "Throws a shuriken that rebounds back when hitting an obstacle or max range."],
    basher: ["basher", "Hammer", "Closed-combat weapon for bashing skulls.", "Bash", "33% chance to stun enemies in the radius of effect for 2 sec."],
    bomber: ["bomber", "Bomb", "Dangerous item that does damage in radius.", "Throw", "Throws a bomb across any obstacle."],
    necromancer: ["necromancer", "Voodoo Power", "Mysterious power of resurrection.", "Fourth of Death", "Summons maximum 4 zombies. Each zombie lives for 10 sec."],
    bandit: ["bandit", "Dagger", "Handy weapon for stabbing.", "Dash", "Moves quickly toward an enemy."],
    scientist: ["scientist", "Magneto", "Electric generator.", "Electric Beam", "Generates hazard beam from a magneto path with reverse gravity."],
    druid: ["druid", "Nature Power", "Power of love and spirit.", "Mind Control", "Makes a monster becoming your friend."],
    builder: ["builder", "Turret", "Automatic ranged weapon.", "Automata", "Creates maximum 2 automatic turrets."],
    viking: ["viking", "Axe", "Rampage viking weapon.", "Bleeding", "Makes an enemy slow down by axe sharp edge."],
    spikey: ["defender", "Spike", "Something sharp enough to pierce your flesh.", "Spike Block", "Makes a block to prevent incoming danger with contact explosive."]
};
var bitmap;
Game.serverNames = {
    asia: "Asia Server ",
    eu: "EU Server ",
    us: "US Server ",
    test: "Test Server "
}, Game.servers = {
    asia: ["ws://blocker-asia1.nanoapp.io:8000/ws", "ws://blocker-asia2.nanoapp.io:8000/ws"],
    eu: ["ws://blocker-eu1.nanoapp.io:8000/ws", "ws://blocker-eu2.nanoapp.io:8000/ws", "ws://blocker-eu3.nanoapp.io:8000/ws"],
    us: ["ws://blocker-us1.nanoapp.io:8000/ws", "ws://blocker-us2.nanoapp.io:8000/ws", "ws://blocker-us3.nanoapp.io:8000/ws"]
}, isTest && (Game.servers.test = ["ws://" + location.hostname + ":8000/ws"]), Server = {
    getHost: function(e) {
        var a = e.split(".");
        return Game.servers[a[0]][a[1]]
    },
    path: window.location.href.substring(0, window.location.href.lastIndexOf("/")) + "/",
    getServer: function() {
        var e, a = location.hash.substring(1).split(".");
        if (a && 2 == a.length && Game.servers[a[0]].length >= Number(a[1])) e = a[0] + "." + Number(a[1] - 1), localStorage.setItem("serv", e);
        else {
            e = localStorage.getItem("serv") || Server.getZone(), localStorage.setItem("serv", e);
            var t = e.split(".");
            Number(t[1]) >= Game.servers[t[0]].length && (e = Server.getZone())
        }
        return e
    },
    getZone: function() {
        var e = new Date,
            a = e.getTimezoneOffset() / 60,
            t = "us";
        return a >= -13 && a <= -5 ? t = "asia" : a <= 2 && a > -5 ? t = "eu" : a <= 12 && a > 2 && (t = "us"), t + "." + Math.floor(Math.random() * Game.servers[t].length)
    }
};
var server = Server.getServer(),
    count = 0,
    min = 1e5,
    max = Game.servers.length,
    idx = 0,
    pinged = !1,
    created = !1,
    canvas, bg;
window.player = null;
var grass, soils, waterGraphics, waterMask, waters = [],
    water, waterSpriteMask, zones, shadows, shadows2, shadows3, shots, rides, names, plants, zombies, heroes, fruits, trees, rocks, towers, weapons, effects, night, bosses, playId, creatures = {},
    shops = {},
    Build = {},
    questBuilds = [],
    terrains = {},
    lastTerrains = [],
    loader, reloader, radar, legend = {
        towers: {},
        campfires: {}
    },
    daynight, white, temp = {
        static: {
            count: 0,
            shadows: []
        },
        dynamic: {
            count: 0,
            shadows: [],
            actives: {}
        },
        tree: {
            count: 0,
            objs: []
        },
        rock: {
            count: 0,
            objs: []
        },
        bush: {
            count: 0,
            objs: []
        },
        build: {
            count: 0,
            objs: []
        }
    },
    startWidth = window.innerWidth,
    startHeight = window.innerHeight;
temp.scale = Math.ceil(startWidth * startHeight * 8e-5), temp.static.size = temp.scale, temp.dynamic.size = Math.ceil(.5 * temp.scale), temp.tree.size = Math.ceil(.75 * temp.scale), temp.rock.size = Math.ceil(.75 * temp.scale), temp.bush.size = Math.ceil(.75 * temp.scale), temp.build.size = 2, temp.rock.size < 44 && (temp.rock.size = 44), temp.bush.size < 40 && (temp.bush.size = 40);
var touch = {
    move: {
        button: null,
        show: function(e) {
            if (touch.move.button != e) {
                var a = window.innerWidth >= 1024 ? 1 : 1.25;
                touch.move.button = e, touch.move.x = e.x, touch.move.y = e.y, button.move.style.left = e.x / a - 40 + "px", button.move.style.top = e.y / a - 40 + "px", button.move.style.display = "block", button.moveStick.style.left = e.x / a - 20 + "px", button.moveStick.style.top = e.y / a - 20 + "px", button.moveStick.style.display = "block"
            }
        },
        hide: function() {
            button.move.style.display = "none", button.moveStick.style.display = "none", touch.move.button = null
        }
    },
    attack: {
        button: null,
        show: function(e) {
            if (touch.attack.button != e) {
                var a = window.innerWidth >= 1024 ? 1 : 1.25;
                touch.attack.button = e, touch.attack.x = e.x, touch.attack.y = e.y, button.attack.style.left = e.x / a - 40 + "px", button.attack.style.top = e.y / a - 40 + "px", button.attack.style.display = "block", button.attackStick.style.left = e.x / a - 20 + "px", button.attackStick.style.top = e.y / a - 20 + "px", button.attackStick.style.display = "block"
            }
        },
        hide: function() {
            button.attack.style.display = "none",
                button.attackStick.style.display = "none", touch.attack.button = null
        }
    }
};
Reaction = {
    action: function(e, a, t) {
        switch (a) {
            case "hit":
                e.hit();
                break;
            case "attack":
                e.attack();
                break;
            case "coin":
                e.getHit(), new Sound("coin");
                break;
            case "recover":
                e.getHit(), new Recover(e.x, e.y, "heart"), new Sound("heal");
                break;
            case "soul":
                e.getHit(), new Recover(e.x, e.y, "soul"), new Sound("heal");
                break;
            case "stun":
                e.status.stun = new Stun(e.x, e.y, e), new Sound("stun");
                break;
            case "burn":
                e.getHit(), new Burn(e);
                break;
            case "freeze":
                new Freeze(e.x, e.y), new Sound("hit.dragon");
                break;
            case "block":
                new Recover(e.x, e.y, "text.block"), new Sound("block");
                break;
            case "fade":
                new Dash(e, e.rotation);
                break;
            case "speed":
                new CrystalEffect("speed", e.x, e.y, e.rotation), e.last.speed = Date.now();
                break;
            case "eater":
                new CrystalEffect("eater", e.x, e.y, e.rotation), e.last.eater = Date.now();
                break;
            case "reflect":
                new CrystalEffect("reflect", e.x, e.y, e.rotation), e.last.reflect = Date.now()
        }
    },
    normal: function(e, a) {
        for (var t in a.act) Reaction.action(e, t, a.act[t])
    }
}, Ads = function() {
    var e = createDOM('<div class="ads bg">    <div *="body" class="ads-body">    <div *="content" class="ads-content"></div><button *="skip" class="skip"></button>    </div>    </div>');
    return e.setTime = function() {
        body.contains(loader) && (body.remove(loader), body.remove(reloader)), clear(e.content), e.content.append(publishes[Math.floor(Math.random() * publishes.length)].data()), e.count = 5, e.skip.disabled = !0, e.skip.textContent = "Spawn in " + e.count + " sec", e.counter = setInterval(function() {
            e.count--, e.skip.textContent = "Spawn in " + e.count + " sec"
        }, 1e3), e.setTimeout = setTimeout(function() {
            clearInterval(e.counter), e.body.offsetHeight > 40 ? (e.skip.disabled = !1, e.skip.textContent = "Spawn", e.skip.onclick = function() {
                ui.sendJoin()
            }) : (e.skip.style.color = "#f00", e.skip.textContent = "Please disable Ads Blocker!!")
        }, 1e3 * e.count)
    }, e.init = function() {
        e.content.append(publishes[Math.floor(Math.random() * publishes.length)].data())
    }, e
}, PlainAds = function(e, a) {
    var t = createDOM('<div style="width:100%;height:100%;background:url(' + Server.path + "ads/" + e + ') no-repeat center;background-size:contain;cursor:pointer"></div>');
    return t.onclick = function() {
        window.open(a)
    }, t
};
var publishes = [{
    data: function() {
        return new PlainAds("fanpage.jpg", "https://facebook.com/blockerofficial/")
    }
}];
Dragon = function(e) {
    var a = new Origin(bosses, "dragon", e, {
        hit: !0,
        shadow: {
            layer: towers,
            scale: 1.35,
            spread: 21
        }
    });
    return a.radius = 40, a.status = {}, a.weapon = new Origin(towers, "dragon.body", e), a.weapon.animations.add("fly", [0, 1, 2, 3], 1, !1), a.weapon.animations.play("fly", 8, !0), a.barBg = game.add.sprite(e.x - 30, e.y - 50, sprites.black), a.barBg.alpha = .2, a.barBg.scale.set(30, 1), a.bar = game.add.sprite(e.x - 30, e.y - 50, sprites.white), a.bar.scale.set(30, 1), a.setBar = function() {
        a.bar.scale.set(a.hp / a.mhp * 30, 1)
    }, effects.add(a.barBg), effects.add(a.bar), a.hit = function() {
        a.getHit(), new Hit(a.x, a.y), new Sound("hit.dragon", a)
    }, a.attack = function() {
        new Sound("dragon.blast")
    }, a.clear = function() {
        new Sound("dragon.dead", a), trees.remove(a), shadows2.remove(a.weapon);
        for (var e = 0; e < 4; e++) {
            var t = a.x + 50 * Math.random() * (Math.random() < .5 ? -1 : 1),
                o = a.y + 50 * Math.random() * (Math.random() < .5 ? -1 : 1);
            new Bone(t, o, a.visible)
        }
        a.weapon.destroy(), a.bar.destroy(), a.barBg.destroy(), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        a.hp != e.hp && (a.hp = e.hp, a.mhp = e.mhp, a.setBar()), e.hp <= 0 ? (e.act.burn && new Burn(a), a.clear()) : checkTween(a, e, function() {
            Reaction.normal(a, e), a.status.stun ? (new Tween(a, a.id, {
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                x: e.x,
                y: e.y
            }, !0)) : (new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }, !0))
        }, function() {
            new Radar(a.x, a.y, "#FFFFFF")
        })
    }, creatures[e.id] = a, a
}, Build.House = function() {
    function e() {
        last.questOn = !1;
        for (var e in questBuilds) {
            var t = game.camera.x + game.input.x,
                o = game.camera.y + game.input.y;
            t > questBuilds[e].x - 50 && questBuilds[e].x + 50 > t && o > questBuilds[e].y - 50 && questBuilds[e].y + 50 > o && 1 == questBuilds[e].questIcon.alpha && (last.questOn = !0)
        }
        player.hp > 0 && last.questOn && (game.input.activePointer.isDown || game.input.pointer1.isDown) && distance(a.x, a.y, player.x, player.y) < 200 && (a.questIcon.alpha = 0, player.questing = !0, body.append(ui.board), new Sound("shop"))
    }
    var a = towers.create(0, 0, "house", 1);
    return a.animations.add("house", [0], 1, !1), a.animations.add("church", [1], 1, !1), a.questIcon = towers.create(0, 0, "quest"), a.questIcon.anchor.set(.5), a.questIcon.alpha = 0, a.quest = game.add.button(0, 0, "quest", null, this, 1, 0, 0), a.quest.input.useHandCursor = !1, a.quest.anchor.set(.5), a.quest.scale.set(1.25), a.quest.alpha = 0, a.quest.onInputDown.add(e, this), questBuilds.push(a), a
}, House = function(e) {
    var a = e;
    return a.x = a.x + 25, a.y = a.y + 25, a.scale = 1.25, a.shadow = {
        layer: shadows3,
        scale: 3.1,
        spread: 40
    }, a.last = 0, a.interval = 0, a.live = function() {
        if (isDesktop && a.last < Date.now() - a.interval) {
            var e = 15 * Math.random() * (Math.random() > .5 ? 1 : -1);
            new Smoke(a.x + 25 + e, a.y - 25 + e), a.last = Date.now(), a.interval = 200 + 800 * Math.random()
        }
    }, terrainGrid(a), a
}, Church = function(e) {
    var a = e;
    return a.x = a.x + 25, a.y = a.y + 25, a.scale = 1.25, a.shadow = {
        layer: shadows3,
        scale: 3.1,
        spread: 40
    }, terrainGrid(a), a
}, Ajax = function(e) {
    var a = new XMLHttpRequest;
    switch (e.method) {
        case "GET":
            a.open(e.method, e.url, !0);
            break;
        case "POST":
            a.open(e.method, e.url, !0), a.setRequestHeader("Content-Type", "application/json")
    }
    return a.onreadystatechange = function() {
        4 == a.readyState && 200 == a.status ? e.callback(a.responseText) : 401 != a.status && 403 != a.status && 500 != a.status || !e.error || (e.error(), a.abort())
    }, e.data ? a.send(e.data) : a.send(), a
}, window.ws, window.onbeforeunload = function(e) {
    ws && ws.close()
};
var last = {
        move: 0,
        attack: 0,
        turn: 0,
        enter: 0,
        mask: 0,
        update: Date.now(),
        LOD: 0
    },
    map = {
        ready: !1,
        firstLoad: !1,
        running: !1,
        season: "spring",
        init: function(e) {
            for (var a in e.data) switch (e.data[a].type) {
                case "tree":
                    new Tree(e.data[a]);
                    break;
                case "rock":
                case "rock.dark":
                    new Rock(e.data[a]);
                    break;
                case "fence.vert":
                case "fence.horz":
                    new Fence(e.data[a]);
                    break;
                case "bush":
                    new Bush(e.data[a]);
                    break;
                case "water":
                    isDesktop && new Water(e.data[a]);
                    break;
                case "grass":
                    new Grass(e.data[a]);
                    break;
                case "soil":
                    new Soil(e.data[a]);
                    break;
                case "clay":
                    new Clay(e.data[a]);
                    break;
                case "house":
                    new House(e.data[a]);
                    break;
                case "church":
                    new Church(e.data[a])
            }
            setTimeout(function() {
                if (map.running || isTest) {
                    map.ready = !0, loader = get("loader"), loader && loader.parentNode.remove(loader), reloader = get("reload"), reloader && isDesktop && reloader.parentNode.remove(reloader), body.append(ui.current), body.append(ui.rank);
                    try {
                        localStorage.getItem("first") || (ui.current.help.click(), localStorage.setItem("first", "true"))
                    } catch (e) {}
                    isDesktop && (ui.current.className = "container desktop")
                } else ui.reload()
            }, 100), grass.endFill();
            for (var a in waters) {
                var e = waters[a];
                waterGraphics.beginFill(9545868, .5), waterGraphics.drawRect(e.x + 3, e.y + 3, e.width - 6, e.height - 6)
            }
            for (var a in waters) {
                var e = waters[a];
                waterGraphics.beginFill(4958882, .5), waterGraphics.drawRect(e.x + 6, e.y + 6, e.width - 12, e.height - 12)
            }
            for (var a in waters) {
                var e = waters[a];
                waterGraphics.beginFill(4037297, .5), waterGraphics.drawRect(e.x + 9, e.y + 9, e.width - 18, e.height - 18)
            }
        },
        play: function(e) {
            if (e.err) alert(e.err);
            else {
                try {
                    gdApi.play()
                } catch (e) {}
                var a = localStorage.getItem("serv").split(".");
                window.history.pushState({}, "Blocker", "/#" + a[0] + "." + (Number(a[1]) + 1)), localStorage.setItem("name", ui.current.name.value), localStorage.setItem("team", ui.team), localStorage.setItem("job", ui.job), e.player.id = decodeURIComponent(e.player.id), player = new Player(e.player), game.camera.follow(player), body.contains(ui.current) && body.remove(ui.current), body.contains(ui.ads) && body.remove(ui.ads), daynight && daynight.show(), mobileUI(), resizeUI()
            }
        },
        update: function(e) {
            Game.teams = {
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                all: 0
            }, Game.towers = {
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                none: 0
            }, Terrain.resetDynamicShadows(), radar.clear();
            for (var a in e) {
                var t = creatures[e[a].id];
                if (t) t.live(e[a]);
                else {
                    var o;
                    switch (e[a].type) {
                        case "hero":
                            Game.teams.all++, Game.teams[e[a].team]++, o = new Hero(e[a]);
                            break;
                        case "zombie":
                            o = new Zombie(e[a]);
                            break;
                        case "bat":
                            o = new Bat(e[a]);
                            break;
                        case "pig":
                            o = new Pig(e[a]);
                            break;
                        case "skeleton":
                            o = new Skeleton(e[a]);
                            break;
                        case "ostrich":
                            o = new Ostrich(e[a]);
                            break;
                        case "reaper":
                            o = new Reaper(e[a]);
                            break;
                        case "wolf":
                            o = new Wolf(e[a]);
                            break;
                        case "slime":
                            o = new Slime(e[a]);
                            break;
                        case "yeti":
                            o = new Yeti(e[a]);
                            break;
                        case "cactus":
                            o = new Cactus(e[a]);
                            break;
                        case "scorpion":
                            o = new Scorpion(e[a]);
                            break;
                        case "dragon":
                            o = new Dragon(e[a]);
                            break;
                        case "npc.male":
                        case "npc.female":
                        case "father":
                            o = new NPC(e[a]);
                            break;
                        case "princess":
                            o = new NPC(e[a], !0);
                            break;
                        case "arrow":
                            o = new Arrow(e[a]);
                            break;
                        case "sonic":
                            o = new Sonic(e[a]);
                            break;
                        case "frost":
                            o = new Frost(e[a]);
                            break;
                        case "poison":
                            o = new Frost(e[a], sprites.poison);
                            break;
                        case "synapse":
                            o = new Frost(e[a], sprites.evil);
                            break;
                        case "blade":
                            o = new Blade(e[a]);
                            break;
                        case "potion":
                            o = new Potion(e[a]);
                            break;
                        case "bomb":
                            o = new Bomb(e[a]);
                            break;
                        case "magneto":
                            o = new Magneto(e[a]);
                            break;
                        case "beam":
                            new Beam(e[a]);
                            break;
                        case "blast":
                            o = new Blast(e[a]);
                            break;
                        case "turret":
                            o = new Turret(e[a]);
                            break;
                        case "spike":
                            o = new Spike(e[a]);
                            break;
                        case "fruit":
                            o = new Fruit(e[a]);
                            break;
                        case "box":
                            o = new Item("box", e[a]);
                            break;
                        case "treasure":
                            o = new Treasure(e[a]);
                            break;
                        case "claw":
                            o = new Item("claw", e[a]);
                            break;
                        case "core":
                            o = new Item("core", e[a]);
                            break;
                        case "campfire":
                            o = new Campfire(e[a]);
                            break;
                        case "crystal.blue":
                        case "crystal.green":
                        case "crystal.yellow":
                            o = new Item(e[a].type, e[a]);
                            break;
                        case "tower":
                            new Tower(e[a]);
                            break;
                        case "flag":
                            new Flag(e[a])
                    }
                    o && o.live(e[a])
                }
            }
            delete Game.towers.none;
            for (var a in Game.towers) ui.stat[a].textContent != Game.towers[a] && (ui.stat[a].textContent = Game.towers[a]);
            player && (ui.stat[player.team].textContent <= 0 ? (ui.quest.outpost.style.display = "block", ui.quest.flag.style.display = "block") : ui.quest.defend.style.display = "block"), map.firstLoad || (map.teamBalance(), map.firstLoad = !0)
        },
        teamBalance: function() {
            function e() {
                var e = createDOM('<button class="none"></button>');
                return e.team = "none", e
            }
            var a = ui.current;
            clear(a.top), Game.teams.A <= Game.teams.all / 4 ? a.top.append(a.A) : a.top.append(e()), Game.teams.B <= Game.teams.all / 4 ? a.top.append(a.B) : a.top.append(e()), Game.teams.C <= Game.teams.all / 4 ? a.top.append(a.C) : a.top.append(e()), Game.teams.D <= Game.teams.all / 4 ? a.top.append(a.D) : a.top.append(e());
            var t = null;
            for (var o in a.top.childNodes) a.top.childNodes[o].team == ui.team && (t = a.top.childNodes[o]);
            if (t) t.click();
            else
                for (var o in a.top.childNodes) "none" != a.top.childNodes[o].team && a.top.childNodes[o].click && a.top.childNodes[o].click()
        },
        resetDynamicShadows: setInterval(function() {
            temp.dynamic.count >= temp.dynamic.size && (temp.dynamic.count = 0, temp.dynamic.actives = {}, Terrain.resetDynamicShadows())
        }, 1e3)
    };
Posses = {
    heart: function(e) {
        var a = Game.style;
        a.fontSize = "13px", a.fontWeight = "bold", e.heart = game.add.text(e.x, e.y, "⬤", a), e.heart.anchor.set(.5), names.add(e.heart), e.heart.visible = !1
    },
    change: function(e, a) {
        e.team != a.team && (e.team = a.team, e.heart.visible = !0, e.heart.addColor(Game.baseColor[e.team], 0), e.name = e.heart)
    },
    destroy: function(e) {
        delete e.name, names.remove(e.heart), e.heart.destroy()
    }
}, Zombie = function(e) {
    var a = new Origin(zombies, "zombie" + ("none" != e.team ? "." + e.team : ""), e, {
        hit: !0,
        shadow: {}
    });
    return a.lastStep = {
        x: 0,
        y: 0
    }, a.status = {}, Posses.heart(a), a.weapon = new Origin(weapons, "zombie.body" + ("none" != e.team ? "." + e.team : ""), e), a.weapon.animations.add("attack"), a.weapon.events.onAnimationComplete.add(function() {
        a.weapon.frame = 0
    }), a.attack = function() {
        a.weapon.animations.play("attack", 20, !1);
        var e = Math.ceil(2 * Math.random());
        new Sound("attack.zombie" + e)
    }, a.hit = function() {
        a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.zombie" + e, a)
    }, a.clear = function() {
        a.hit(), zombies.remove(a), weapons.remove(a.weapon), Posses.destroy(a), new Bone(a.x, a.y, a.visible), a.weapon.destroy(), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        e.hp <= 0 ? (e.act.burn && new Burn(a), a.clear()) : checkTween(a, e, function() {
            Reaction.normal(a, e), Posses.change(a, e), a.status.stun ? (new Tween(a, a.id, {
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                x: e.x,
                y: e.y
            }, !0)) : (new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }, !0), waterStep(a, e))
        })
    }, creatures[e.id] = a, a
}, Bat = function(e) {
    var a = new Origin(zombies, "bat", e, {
        hit: !0,
        shadow: {
            scale: .8,
            spread: 15
        }
    });
    return a.status = {}, Posses.heart(a), a.weapon = new Origin(weapons, "bat.body", e), a.weapon.animations.add("fly", [0, 1, 2, 3], 1, !1), a.weapon.animations.play("fly", 15, !0), a.hit = function() {
        a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(2 * Math.random());
        new Sound("hit.bat" + e, a)
    }, a.clear = function() {
        a.hit(), zombies.remove(a), weapons.remove(a.weapon), Posses.destroy(a), new Bone(a.x, a.y, a.visible), a.weapon.destroy(), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        e.hp <= 0 ? (e.act.burn && new Burn(a), a.clear()) : checkTween(a, e, function() {
            Reaction.normal(a, e), Posses.change(a, e), a.status.stun ? (new Tween(a, a.id, {
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                x: e.x,
                y: e.y
            }, !0)) : (new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }, !0))
        })
    }, creatures[e.id] = a, a
}, Pig = function(e) {
    var a = new Origin(zombies, "pig", e, {
        hit: !0,
        shadow: {
            scale: .95,
            spread: 16.5
        }
    });
    return a.status = {}, a.lastStep = {
        x: 0,
        y: 0
    }, a.hit = function() {
        a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(2 * Math.random());
        new Sound("hit.pig" + e, a, .5)
    }, a.clear = function() {
        a.hit(), zombies.remove(a), new Bone(a.x, a.y, a.visible), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        e.hp <= 0 ? (e.act.burn && new Burn(a), a.clear()) : checkTween(a, e, function() {
            Reaction.normal(a, e), a.status.stun ? new Tween(a, a.id, {
                x: e.x,
                y: e.y
            }) : (new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), waterStep(a, e, 450))
        })
    }, creatures[e.id] = a, a
}, Skeleton = function(e) {
    var a = new Origin(zombies, "skeleton", e, {
        hit: !0,
        shadow: {}
    });
    return a.lastStep = {
        x: 0,
        y: 0
    }, a.status = {}, Posses.heart(a), a.weapon = new Origin(weapons, "skeleton.body", e), a.weapon.animations.add("attack"), a.weapon.events.onAnimationComplete.add(function() {
        a.weapon.frame = 0
    }), a.attack = function() {
        a.weapon.animations.play("attack", 20, !1), new Sound("attack.warrior")
    }, a.hit = function() {
        a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.skeleton" + e, a)
    }, a.clear = function() {
        a.hit(), zombies.remove(a), weapons.remove(a.weapon), Posses.destroy(a), new Bone(a.x, a.y, a.visible), a.weapon.destroy(), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        e.hp <= 0 ? (e.act.burn && new Burn(a), a.clear()) : checkTween(a, e, function() {
            Reaction.normal(a, e), Posses.change(a, e), a.status.stun ? (new Tween(a, a.id, {
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                x: e.x,
                y: e.y
            }, !0)) : (new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }, !0), waterStep(a, e))
        })
    }, creatures[e.id] = a, a
}, Wolf = function(e) {
    var a = new Origin(zombies, "wolf", e, {
        hit: !0,
        shadow: {}
    });
    return a.lastStep = {
        x: 0,
        y: 0
    }, a.status = {}, Posses.heart(a), a.weapon = new Origin(weapons, "wolf.body", e), a.weapon.animations.add("wolf.body", [0, 1, 2, 3], 1, !1), a.weapon.animations.play("wolf.body", 6, !0), a.hit = function() {
        a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(2 * Math.random());
        new Sound("hit.wolf" + e, a)
    }, a.attack = function() {
        new Dash(a, a.rotation);
        var e = Math.ceil(2 * Math.random());
        new Sound("attack.wolf" + e)
    }, a.clear = function() {
        a.hit(), zombies.remove(a), weapons.remove(a.weapon), Posses.destroy(a), new Bone(a.x, a.y, a.visible), a.weapon.destroy(), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        e.hp <= 0 ? (e.act.burn && new Burn(a), a.clear()) : checkTween(a, e, function() {
            Reaction.normal(a, e), Posses.change(a, e), a.status.stun ? (new Tween(a, a.id, {
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                x: e.x,
                y: e.y
            }, !0)) : (new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }, !0), e.act.riding || waterStep(a, e))
        })
    }, creatures[e.id] = a, a
}, Turret = function(e) {
    var a = new Origin(zombies, "turret", e, {
        hit: !0,
        shadow: {}
    });
    return a.lastStep = {
        x: 0,
        y: 0
    }, a.status = {}, a.hit = function() {
        a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.skeleton" + e, a)
    }, a.attack = function() {
        new Sound("attack.ranger", a)
    }, a.clear = function() {
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.skeleton" + e, a), zombies.remove(a), new Bone(a.x, a.y, a.visible), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        e.hp <= 0 ? (e.act.burn && new Burn(a), a.clear()) : checkTween(a, e, function() {
            Reaction.normal(a, e), new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            })
        })
    }, creatures[e.id] = a, a
}, Spike = function(e) {
    var a = new Origin(zombies, "spike", e, {
        hit: !0,
        shadow: {}
    });
    return a.lastStep = {
        x: 0,
        y: 0
    }, a.status = {}, a.hit = function() {
        a.getHit(), isDesktop && new Hit(a.x, a.y);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.player" + e, a)
    }, a.clear = function() {
        zombies.remove(a), a.visible && (isDesktop ? new Hit(a.x, a.y) : new Bone(a.x, a.y, !0)), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        checkTween(a, e, function() {
            Reaction.normal(a, e)
        }), e.hp <= 0 && (e.act.burn && new Burn(a), a.visible && e.act.explode && (new Sound("bomb"), new Explode(a.x, a.y, 120)), a.clear())
    }, creatures[e.id] = a, a
}, Reaper = function(e) {
    var a = new Origin(bosses, "reaper", e, {
        hit: !0,
        shadow: {
            scale: 1.4,
            spread: 23,
            layer: towers
        }
    });
    return a.lastStep = {
        x: 0,
        y: 0
    }, a.status = {}, Posses.heart(a), a.weapon = new Origin(towers, "reaper.body", e), a.weapon.animations.add("attack"), a.weapon.events.onAnimationComplete.add(function() {
        a.weapon.frame = 0
    }), a.attack = function() {
        a.weapon.animations.play("attack", 20, !1), new Sound("attack.warrior")
    }, a.hit = function() {
        a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.zombie" + e, a)
    }, a.clear = function() {
        if (a.visible) {
            e.act.burn = 1, Reaction.normal(a, e), ExplodeSmoke(a.x, a.y);
            var t = Math.ceil(2 * Math.random());
            isDesktop && new SoundVolume("hit.reaper" + t, .5)
        }
        bosses.remove(a), towers.remove(a.weapon), Posses.destroy(a), new Bone(a.x, a.y, a.visible), a.weapon.destroy(), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        e.hp <= 0 ? a.clear() : checkTween(a, e, function() {
            Reaction.normal(a, e), Posses.change(a, e), e.act.dash && new Dash(a, a.rotation), a.status.stun ? (new Tween(a, a.id, {
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                x: e.x,
                y: e.y
            }, !0)) : (new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }, !0))
        })
    }, creatures[e.id] = a, a
}, Slime = function(e) {
    function a() {
        t.animX = !t.animX, t.animX ? t.anim = game.add.tween(t.scale).to({
            x: 1.15,
            y: .95
        }, 400, Phaser.Easing.None, !0) : t.anim = game.add.tween(t.scale).to({
            x: .95,
            y: 1.15
        }, 400, Phaser.Easing.None, !0), t.anim.onComplete.add(function() {
            a()
        }, this)
    }
    e.scale = .95;
    var t = new Origin(zombies, "slime", e, {
        hit: !0,
        shadow: {
            scale: .95,
            spread: 16.5
        }
    });
    return t.status = {}, t.lastStep = {
        x: 0,
        y: 0
    }, Posses.heart(t), t.animX = !1, a(), t.hit = function() {
        t.getHit(), new Hit(t.x, t.y), new Sound("hit.slime", t)
    }, t.attack = function() {
        new Sound("attack.mage")
    }, t.clear = function() {
        t.hit(), zombies.remove(t), Posses.destroy(t), new Bone(t.x, t.y, t.visible), t.anim.stop(), t.destroy(), delete creatures[t.id], t = null
    }, t.live = function(e) {
        e.hp <= 0 ? (e.act.burn && new Burn(t), t.clear()) : checkTween(t, e, function() {
            Reaction.normal(t, e), Posses.change(t, e), t.status.stun ? new Tween(t, t.id, {
                x: e.x,
                y: e.y
            }) : (new Tween(t, t.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), waterStep(t, e, 500))
        })
    }, creatures[e.id] = t, t
}, Yeti = function(e) {
    var a = new Origin(zombies, "yeti", e, {
        hit: !0,
        shadow: {}
    });
    return a.lastStep = {
        x: 0,
        y: 0
    }, a.status = {}, Posses.heart(a), a.weapon = new Origin(weapons, "yeti.body", e), a.weapon.animations.add("attack"), a.weapon.events.onAnimationComplete.add(function() {
        a.weapon.frame = 0
    }), a.attack = function() {
        a.weapon.animations.play("attack", 20, !1), new Sound("attack.warrior")
    }, a.hit = function() {
        a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.zombie" + e, a)
    }, a.clear = function() {
        a.hit(), zombies.remove(a), weapons.remove(a.weapon), Posses.destroy(a), new Bone(a.x, a.y, a.visible), a.weapon.destroy(), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        e.hp <= 0 ? (e.act.burn && new Burn(a), a.clear()) : checkTween(a, e, function() {
            Reaction.normal(a, e), Posses.change(a, e), a.status.stun ? (new Tween(a, a.id, {
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                x: e.x,
                y: e.y
            }, !0)) : (new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }, !0), waterStep(a, e))
        })
    }, creatures[e.id] = a, a
}, Cactus = function(e) {
    var a = new Origin(zombies, "cactus", e, {
        hit: !0,
        shadow: {}
    });
    return a.lastStep = {
        x: 0,
        y: 0
    }, a.status = {}, Posses.heart(a), a.weapon = new Origin(weapons, "cactus.body", e), a.weapon.animations.add("attack"), a.weapon.events.onAnimationComplete.add(function() {
        a.weapon.frame = 0
    }), a.attack = function() {
        a.weapon.animations.play("attack", 35, !1);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.zombie" + e, a)
    }, a.hit = function() {
        a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.zombie" + e, a)
    }, a.clear = function() {
        a.hit(), zombies.remove(a), weapons.remove(a.weapon), Posses.destroy(a), new Bone(a.x, a.y, a.visible), a.weapon.destroy(), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        e.hp <= 0 ? (e.act.burn && new Burn(a), a.clear()) : checkTween(a, e, function() {
            Reaction.normal(a, e), Posses.change(a, e), a.status.stun ? (new Tween(a, a.id, {
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                x: e.x,
                y: e.y
            }, !0)) : (new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }, !0), waterStep(a, e))
        })
    }, creatures[e.id] = a, a
}, Scorpion = function(e) {
    var a = new Origin(zombies, "scorpion", e, {
        hit: !0,
        shadow: {
            scale: .8,
            spread: 15
        }
    });
    return a.status = {}, Posses.heart(a), a.weapon = new Origin(weapons, "scorpion.body", e), a.weapon.animations.add("walk", [0, 1, 2, 3], 1, !1), a.weapon.animations.play("walk", 12, !0), a.hit = function() {
        a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.zombie" + e, a)
    }, a.attack = function() {
        new Sound("attack.mage")
    }, a.clear = function() {
        a.hit(), zombies.remove(a), weapons.remove(a.weapon), Posses.destroy(a), new Bone(a.x, a.y, a.visible), a.weapon.destroy(), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        e.hp <= 0 ? (e.act.burn && new Burn(a), a.clear()) : checkTween(a, e, function() {
            Reaction.normal(a, e), Posses.change(a, e), a.status.stun ? (new Tween(a, a.id, {
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                x: e.x,
                y: e.y
            }, !0)) : (new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }, !0))
        })
    }, creatures[e.id] = a, a
}, Hit = function(e, a) {
    if (isDesktop) {
        var t = game.add.emitter(e, a, 5);
        t.makeParticles(sprites.flake), t.gravity = 100, t.start(!0, 250, null, 5), setTimeout(function() {
            t.destroy()
        }, 250)
    } else new Bone(e, a, !0)
}, Flare = function(e, a, t) {
    if (isDesktop) {
        var o = game.add.emitter(e, a, 1);
        o.makeParticles(sprites.flare), o.gravity = 100, o.start(!0, 250, null, 1), setTimeout(function() {
            o.destroy()
        }, 250)
    }
}, Flake = function(e, a, t, o) {
    var s = new Origin(null, o || sprites.frost, {
            x: e,
            y: a,
            rotation: t + .25 * Math.PI
        }),
        n = game.add.tween(s).to({
            alpha: 0
        }, 600, Phaser.Easing.Exponential.Out, !0);
    game.add.tween(s.scale).to({
        x: 4,
        y: 4
    }, 600, Phaser.Easing.Exponential.Out, !0);
    if (n.onComplete.add(function() {
            s.destroy()
        }, this), isDesktop) {
        var i = new Origin(null, o || sprites.frost, {
                x: e - -25 * Math.cos(t),
                y: a - -25 * Math.sin(t),
                rotation: t + .25 * Math.PI,
                scale: .5
            }),
            r = game.add.tween(i).to({
                alpha: 0
            }, 800, Phaser.Easing.Exponential.Out, !0);
        game.add.tween(i.scale).to({
            x: 2,
            y: 2
        }, 800, Phaser.Easing.Exponential.Out, !0);
        r.onComplete.add(function() {
            i.destroy()
        }, this)
    }
    return s
}, Bone = function(e, a, t) {
    if (t || !0)
        if (isDesktop) {
            var o = game.add.emitter(e, a, 5);
            o.makeParticles("bone"), o.gravity = 100, o.width = 50, o.setAlpha(1, 0, 2e3, Phaser.Easing.Exponential.In), o.start(!0, 2e3, null, 5), setTimeout(function() {
                o.destroy()
            }, 2e3)
        } else new Wave(e, a, -.25 * Math.PI)
}, Smoke = function(e, a) {
    var t = new Origin(effects, "smoke", {
        x: e,
        y: a,
        scale: 1 * Math.random() + 1
    }, {
        visible: !0
    });
    return game.add.tween(t).to({
        y: a - 120,
        alpha: 0
    }, 2e3, Phaser.Easing.None, !0).onComplete.add(function() {
        effects.remove(t), t.destroy()
    }, this), t
}, Wave = function(e, a, t) {
    var o = new Origin(null, sprites.flake, {
            x: e,
            y: a,
            rotation: t + .25 * Math.PI,
            scale: 3,
            alpha: .75
        }),
        s = game.add.tween(o).to({
            alpha: 0
        }, 250, Phaser.Easing.Exponential.Out, !0);
    game.add.tween(o.scale).to({
        x: 11,
        y: 11
    }, 250, Phaser.Easing.Exponential.Out, !0);
    return s.onComplete.add(function() {
        o.destroy()
    }, this), o
}, Fade = function(e, a, t, o) {
    var s = new Origin(weapons, sprites.fade, {
        x: e,
        y: a,
        rotation: t + .25 * Math.PI,
        scale: 30,
        alpha: o
    }, {
        visible: !0
    });
    return game.add.tween(s).to({
        alpha: 0
    }, 200, Phaser.Easing.None, !0).onComplete.add(function() {
        weapons.remove(s), s.destroy()
    }, this), s
}, Flame = function(e, a, t) {
    if (isDesktop) {
        var o = new Origin(null, sprites.flame, {
                x: e,
                y: a,
                rotation: t + .25 * Math.PI
            }),
            s = game.add.tween(o).to({
                alpha: 0
            }, 600, Phaser.Easing.Exponential.Out, !0);
        game.add.tween(o.scale).to({
            x: 3.5,
            y: 3.5
        }, 600, Phaser.Easing.Exponential.Out, !0);
        s.onComplete.add(function() {
            o.destroy()
        }, this);
        var n = game.add.emitter(e, a, 1);
        n.makeParticles(sprites.flame3), n.gravity = -200, n.setAlpha(.75), n.start(!0, 600, null, 1), setTimeout(function() {
            n.destroy()
        }, 600);
        var i = game.add.emitter(e, a, 2);
        i.makeParticles(sprites.flame2), i.gravity = -100, i.setAlpha(.75), i.start(!0, 300, null, 2), setTimeout(function() {
            i.destroy(), isDesktop || o.destroy()
        }, 300);
        var r = game.add.emitter(e, a, 3);
        return r.makeParticles(sprites.flame), r.gravity = -50, r.start(!0, 200, null, 3), setTimeout(function() {
            r.destroy()
        }, 200), o
    }
    new Flake(e + 9 * Math.random() * multiplier(), a + 9 * Math.random() * multiplier(), Math.random() * Math.PI * multiplier(), sprites.flame1), new Flake(e + 9 * Math.random() * multiplier(), a + 9 * Math.random() * multiplier(), Math.random() * Math.PI * multiplier(), sprites.flame1), new Flake(e + 9 * Math.random() * multiplier(), a + 9 * Math.random() * multiplier(), Math.random() * Math.PI * multiplier(), sprites.flame1)
}, Burn = function(e) {
    e.visible && (new Flame(e.x, e.y, e.rotation), setTimeout(function() {
        e && new Flame(e.x, e.y, e.rotation)
    }, 300), setTimeout(function() {
        e && new Flame(e.x, e.y, e.rotation)
    }, 600))
}, Ripple = function(e, a, t, o, s) {
    var n = game.add.graphics(a, t);
    n.beginFill(16777215, .5), n.drawCircle(0, 0, 1), n.endFill(), n.anchor.set(.5), zones.add(n), n.mask = o;
    var i = game.add.tween(n).to({
        alpha: 0
    }, 1200, Phaser.Easing.Exponential.Out, !0);
    game.add.tween(n.scale).to({
        x: 70,
        y: 70
    }, 1200, Phaser.Easing.Exponential.Out, !0);
    i.onComplete.add(function() {
        zones.remove(n), n.destroy()
    }, this), setTimeout(function() {
        delete e.ripple
    }, s || 300);
    var r = Math.ceil(5 * Math.random());
    return new SoundVolume("water" + r, .1), e.ripple = n, n
}, CrystalEffect = function(e, a, t, o) {
    var s = new Origin(weapons, sprites[e], {
        x: a,
        y: t,
        rotation: o,
        scale: 35,
        alpha: .75
    }, {
        visible: !0
    });
    return game.add.tween(s).to({
        alpha: 0
    }, 500, Phaser.Easing.None, !0).onComplete.add(function() {
        weapons.remove(s), s.destroy()
    }, this), s
}, Capture = function(e, a, t, o) {
    var s = Game.style;
    s.fill = Game.baseColor[o], s.wordWrapWidth = t, s.fontSize = "17px", s.fontWeight = "bold";
    var n = game.add.text(e, a, Game.baseCapture[o], s);
    n.anchor.set(.5), game.add.tween(n).to({
        y: a - 70
    }, 2e3, Phaser.Easing.Elastic.Out, !0).onComplete.add(function() {
        n.destroy()
    }, this)
}, Recover = function(e, a, t) {
    var o = new Origin(null, t, {
        x: e,
        y: a
    });
    game.add.tween(o).to({
        y: a - 120,
        alpha: 0
    }, isDesktop ? 2e3 : 1e3, Phaser.Easing.None, !0).onComplete.add(function() {
        o.destroy()
    }, this)
}, Coin = function(e, a) {
    if (isDesktop) {
        var t = game.add.emitter(e, a, 3);
        t.makeParticles("coin"), t.gravity = 80, t.width = 50, t.setAlpha(1, 0, 1500, Phaser.Easing.Exponential.In), t.start(!0, 1500, null, 5), setTimeout(function() {
            t.destroy()
        }, 1500)
    }
}, ExplodeSmoke = function(e, a) {
    new Smoke(e + 30 * Math.random() * (Math.random() < .5 ? -1 : 1), a + 30 * Math.random() * (Math.random() < .5 ? -1 : 1)), isDesktop && (new Smoke(e + 30 * Math.random() * (Math.random() < .5 ? -1 : 1), a + 30 * Math.random() * (Math.random() < .5 ? -1 : 1)), new Smoke(e + 30 * Math.random() * (Math.random() < .5 ? -1 : 1), a + 30 * Math.random() * (Math.random() < .5 ? -1 : 1)))
}, Explode = function(e, a, t) {
    var o = game.add.graphics(e, a);
    o.beginFill(16777215, 1), o.drawCircle(0, 0, t), o.endFill(), o.anchor.set(.5), rocks.add(o), setTimeout(function() {
        rocks.remove(o), o.destroy()
    }, isDesktop ? 20 : 10), new ExplodeSmoke(e, a)
}, Stun = function(e, a, t) {
    var o = new Origin(null, "stun", {
        x: e,
        y: a
    });
    game.add.tween(o).to({
        rotation: 2 * Math.PI
    }, 2e3, Phaser.Easing.None, !0);
    return game.add.tween(o).to({
        alpha: 0
    }, 2e3, Phaser.Easing.Exponential.In, !0).onComplete.add(function() {
        o.destroy(), delete t.status.stun
    }, this), o
}, Freeze = function(e, a) {
    new Flake(e + 9 * Math.random() * multiplier(), a + 9 * Math.random() * multiplier(), Math.random() * Math.PI * multiplier(), sprites.frost), new Flake(e + 9 * Math.random() * multiplier(), a + 9 * Math.random() * multiplier(), Math.random() * Math.PI * multiplier(), sprites.frost), new Flake(e + 9 * Math.random() * multiplier(), a + 9 * Math.random() * multiplier(), Math.random() * Math.PI * multiplier(), sprites.frost)
}, Revive = function(e, a, t) {
    var o = game.add.emitter(e, a, 5);
    o.makeParticles(sprites.heal), o.gravity = -50, o.start(!0, 1e3, null, 5), setTimeout(function() {
        o.destroy()
    }, 1e3);
    var s = new Origin(null, "revive", {
        x: e,
        y: a
    });
    return game.add.tween(s).to({
        alpha: 0
    }, 2e3, Phaser.Easing.Exponential.In, !0).onComplete.add(function() {
        s.destroy(), delete t.status.revive
    }, this), s
}, Dash = function(e, a) {
    function t() {
        new Fade(e.x, e.y, a, o), o += .2
    }
    var o = .2;
    setTimeout(t, 20), setTimeout(t, 60), setTimeout(t, 100)
}, Night = function() {
    var e = game.add.sprite(0, 0, sprites.night);
    return e.blendMode = PIXI.blendModes.MULTIPLY, e.alpha = 0, e.width = window.innerWidth + 20, e.height = window.innerHeight + 20, e.x = game.camera.x - 10, e.y = game.camera.y - 10, e.visible = !1, e.status = !1, e.updateLight = function(a) {
        a ? (e.light.forEach(function(e) {
            e.on()
        }), ui.quest.nightmares.style.display = "block") : (e.light.forEach(function(e) {
            e.off()
        }), ui.quest.nightmares.style.display = "none")
    }, e.update = function(a) {
        if (void 0 !== a && e.status != a)
            if (e.status = a, e.status) e.visible = !0, game.add.tween(e).to({
                alpha: .3
            }, 1500, Phaser.Easing.None, !0), e.updateLight(!0);
            else {
                var t = game.add.tween(e).to({
                    alpha: 0
                }, 1500, Phaser.Easing.None, !0);
                t.onComplete.add(function() {
                    e.visible = !1
                }, this), e.updateLight(!1)
            }
    }, e.light = [], e
}, Light = function(e, a) {
    var t = effects.create(e + 25, a + 25, "light");
    t.blendMode = PIXI.blendModes.ADD, t.anchor.set(.5), t.scale.set(5), t.alpha = 0, t.visible = !1, t.on = function() {
        t.visible = !0, game.add.tween(t).to({
            alpha: .65
        }, 1500, Phaser.Easing.None, !0)
    }, t.off = function() {
        game.add.tween(t).to({
            alpha: 0
        }, 1500, Phaser.Easing.None, !0).onComplete.add(function() {
            t.visible = !1
        }, this)
    }, night.light.push(t)
}, Arrow = function(e) {
    var a = new Origin(shots, "arrow", e, {
        x: -25,
        y: -25
    });
    return a.clear = function() {
        clearTimeout(a.time), shots.remove(a), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        checkTween(a, e, function() {
            new Tween(a, a.id, {
                x: e.x - 25,
                y: e.y - 25
            }), e.act && e.act.collided && (new Hit(a.x, a.y), a.clear())
        })
    }, a.time = setTimeout(function() {
        a.clear()
    }, 5e3), creatures[e.id] = a, a
}, Sonic = function(e) {
    var a = {
        id: e.id,
        x: e.x,
        y: e.y
    };
    return a.wave = new Wave(e.x - 25, e.y - 25, e.rotation), a.clear = function() {
        clearTimeout(a.time), a.wave.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        checkTween(a, e, function() {
            new Wave(e.x - 25, e.y - 25, e.rotation), new Sound("attack.bat")
        }), e.act && e.act.collided && a.clear()
    }, a.time = setTimeout(function() {
        a.clear()
    }, 700), creatures[e.id] = a, a
}, Frost = function(e, a) {
    var t = {
        id: e.id,
        x: e.x,
        y: e.y
    };
    return t.clear = function() {
        clearTimeout(t.time), delete creatures[t.id], t = null
    }, t.live = function(e) {
        checkTween(t, e, function() {
            a ? new Flake(e.x - 25, e.y - 25, e.rotation, a) : new Flake(e.x - 25, e.y - 25, e.rotation), e.act && e.act.collided && (new Hit(e.x, e.y), t.clear())
        })
    }, t.time = setTimeout(function() {
        t.clear()
    }, 1500), creatures[e.id] = t, t
}, Blade = function(e) {
    var a = new Origin(shots, "blade", e, {
        x: -25,
        y: -25
    });
    return a.shadowImage = new Origin(shadows, "blade.shadow", e, {
        x: -16,
        y: -16
    }), a.shadowImage.alpha = .08, a.shadowImage.spread = 9, a.clear = function() {
        shots.remove(a), a.shadowImage && (shadows.remove(a.shadowImage), a.shadowImage.destroy()), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        checkTween(a, e, function() {
            game.add.tween(a).to({
                rotation: a.rotation - Math.PI
            }, 100, Phaser.Easing.None, !0), new Tween(a, a.id, {
                x: e.x - 25,
                y: e.y - 25
            }), game.add.tween(a.shadowImage).to({
                rotation: a.shadowImage.rotation - Math.PI
            }, 100, Phaser.Easing.None, !0), new Tween(a.shadowImage, a.id + "s", {
                x: e.x - 15,
                y: e.y - 15
            }), isDesktop && new SoundVolume("attack.shinobi", .05), e.act && (e.act.collided && (isDesktop ? (new Hit(e.x, e.y), new Sound("reflect")) : new Bone(e.x, e.y, !0)), e.act.back && a.clear())
        }, function() {
            e.act && e.act.back && a.clear()
        })
    }, creatures[e.id] = a, a
}, Potion = function(e) {
    delete e.rotation;
    var a = new Origin(shots, "potion", e, {
        x: -25,
        y: -25
    });
    return a.clear = function() {
        clearTimeout(a.time), shots.remove(a), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        checkTween(a, e, function() {
            if (new Tween(a, a.id, {
                    x: e.x - 25,
                    y: e.y - 25
                }), e.act && e.act.collided) {
                new Hit(a.x, a.y);
                var t = Math.ceil(3 * Math.random());
                new Sound("glass" + t), a.clear()
            }
        }, function() {
            e.act && e.act.collided && a.clear()
        })
    }, a.time = setTimeout(function() {
        a.clear()
    }, 6400), creatures[e.id] = a, a
}, Magneto = function(e) {
    delete e.rotation;
    var a = new Origin(shots, "magneto", e, {
        x: -25,
        y: -25
    });
    return a.animations.add("hit"), a.events.onAnimationComplete.add(function() {
        a.clear()
    }), a.clear = function() {
        clearTimeout(a.time), shots.remove(a), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        checkTween(a, e, function() {
            new Tween(a, a.id, {
                x: e.x - 25,
                y: e.y - 25
            }), e.act && e.act.collided && a.animations.play("hit", 10, !1)
        }, function() {
            e.act && e.act.collided && a.clear()
        })
    }, a.time = setTimeout(function() {
        a.clear()
    }, 6e3), creatures[e.id] = a, a
}, Beam = function(e) {
    var a = game.add.graphics(-30, -30);
    a.lineStyle(1, 16777215), a.moveTo(e.x, e.y), a.lineTo(e.end.x, e.end.y), a.anchor.set(.5);
    var t = game.add.graphics(-30, -30);
    t.lineStyle(3, 16760576), t.moveTo(e.x, e.y), t.lineTo(e.end.x, e.end.y), t.anchor.set(.5), zones.add(t), zones.add(a);
    var o = game.add.tween(a).to({
        alpha: 0
    }, 300, Phaser.Easing.None, !0);
    game.add.tween(t).to({
        alpha: 0
    }, 300, Phaser.Easing.Exponential.Out, !0);
    o.onComplete.add(function() {
        zones.remove(a), zones.remove(t), a.destroy(), t.destroy()
    }, this)
}, Bomb = function(e) {
    delete e.rotation;
    var a, t, o = new Origin(shadows3, "bomb", e, {
        x: -25,
        y: -25
    });
    return a = game.add.tween(o).to({
        rotation: Math.PI
    }, 1e3, Phaser.Easing.None, !0, 1, 1, !1).loop(!0), o.shadowImage = new Origin(trees, "bomb.shadow", e, {
        x: -18,
        y: -18
    }), o.shadowImage.alpha = .08, o.shadowImage.spread = 7, t = game.add.tween(o.shadowImage).to({
        rotation: Math.PI
    }, 1e3, Phaser.Easing.None, !0, 1, 1, !1).loop(!0), o.clear = function() {
        a.stop(), t.stop(), shadows3.remove(o), o.shadowImage && (trees.remove(o.shadowImage), o.shadowImage.destroy()), o.destroy(), delete creatures[o.id], o = null
    }, o.live = function(e) {
        checkTween(o, e, function() {
            new Tween(o, o.id, {
                x: e.x - 25,
                y: e.y - 25
            }), o && new Flare(o.x, o.y), e.act && (e.act.collided && (a.stop(), t.stop()), e.act.explode ? (new Sound("bomb"), new Explode(e.x, e.y, 170), o.clear()) : e.act.hit && (new Hit(o.x, o.y), o.clear()))
        }, function() {
            e.act && e.act.collided && o.clear()
        })
    }, creatures[e.id] = o, o
}, Blast = function(e) {
    var a = {
        id: e.id,
        x: e.x,
        y: e.y
    };
    return a.clear = function() {
        clearTimeout(a.time), delete creatures[a.id], a = null
    }, a.live = function(e) {
        checkTween(a, e, function() {
            new Flame(e.x - 25, e.y - 25, e.rotation), e.act && e.act.collided && (new Explode(e.x, e.y, 200), new Sound("bomb", a), a.clear())
        }, function() {
            e.act && e.act.collided && a.clear()
        })
    }, a.time = setTimeout(function() {
        a.clear()
    }, 1e3), creatures[e.id] = a, a
}, NodeList.prototype.forEach = Array.prototype.forEach, Element.prototype.append = function(e) {
    this.appendChild(e)
}, Element.prototype.remove = function(e) {
    this.removeChild(e)
}, Element.prototype.set = function(e, a) {
    this.setAttribute(e, a)
};
var parser = new DOMParser,
    tweens = {};
Tween = function(e, a, t, o) {
    this.id = a, this.data = t, this.obj = e, this.time = Game.framerate, this.count = Game.framerate, this.slow = o ? 2.5 : 1, t.x && (this.dx = e.x - t.x, this.mx = Math.abs(this.dx) / this.time), t.y && (this.dy = e.y - t.y, this.my = Math.abs(this.dy) / this.time), t.rotation && (this.dr = e.rotation - t.rotation, (Math.abs(this.dr) > Math.PI || 0 == this.dr) && (this.dr = Math.PI - Math.abs(e.rotation) + (Math.PI - Math.abs(t.rotation)), e.rotation > t.rotation && (this.dr = -this.dr)), this.mr = Math.abs(this.dr) / (this.time * this.slow)), tweens[this.id] = this
}, Tween.prototype.update = function() {
    if (this.count > 0) {
        if (this.obj.visible)
            for (var e in this.data) this.option(e)
    } else delete tweens[this.id];
    this.count--
}, Tween.prototype.option = function(e) {
    var a = this.obj;
    switch (e) {
        case "x":
            this.dx < 0 ? a.x += this.mx : this.dx > 0 && (a.x -= this.mx);
            break;
        case "y":
            this.dy < 0 ? a.y += this.my : this.dy > 0 && (a.y -= this.my);
            break;
        case "rotation":
            var t = a.rotation;
            this.dr < 0 ? (t += this.mr) > Math.PI && (t = -Math.PI + (t - Math.PI)) : this.dr > 0 && (t -= this.mr) < -Math.PI && (t = Math.PI - (Math.abs(t) - Math.PI)), a.rotation = t
    }
    a.shadowImage && (a.shadowImage.x = a.x + a.shadowImage.spread, a.shadowImage.y = a.y + a.shadowImage.spread), a.name && (a.name.x = a.x, a.name.y = a.y - a.radius - a.radius / 4), a.text && (a.text.x = a.x, a.text.y = a.y - a.radius - a.radius / 2, a.textBubble.x = a.x, a.textBubble.y = a.y - a.radius), a.coin && a.coinIcon && (a.coinIcon.x = a.x - 3 - 5 * a.coinLength / 2, a.coinIcon.y = a.y - 53, a.coin.x = a.x, a.coin.y = a.y - 50), a.bar && (a.bar.x = a.x - 30, a.bar.y = a.y - 50, a.barBg.x = a.x - 30, a.barBg.y = a.y - 50), a.status && (a.status.stun && (a.status.stun.x = a.x, a.status.stun.y = a.y), a.status.revive && (a.status.revive.x = a.x, a.status.revive.y = a.y)), a.fashion && (a.fashion.x = a.x, a.fashion.y = a.y, a.fashion.rotation = a.rotation), a == player && (a.weapon.x = a.x, a.weapon.y = a.y)
};
var mobileMargin = .17 * window.innerWidth;
Control = {
    direction4Filter: function(e) {
        return e > -.25 * Math.PI && e <= .25 * Math.PI ? e = 1e-4 : e > .25 * Math.PI && e <= .75 * Math.PI ? e = .5 * Math.PI : e > .75 * Math.PI || e <= -.75 * Math.PI ? e = Math.PI : e < -.25 * Math.PI && e >= -.75 * Math.PI && (e = -.5 * Math.PI), e
    },
    direction8Filter: function(e) {
        return e > -.125 * Math.PI && e <= .125 * Math.PI ? e = 1e-4 : e > .375 * Math.PI && e <= .625 * Math.PI ? e = .5 * Math.PI : e > .875 * Math.PI || e <= -.875 * Math.PI ? e = Math.PI : e < -.375 * Math.PI && e >= -.625 * Math.PI ? e = -.5 * Math.PI : e > .125 * Math.PI && e <= .375 * Math.PI ? e = .25 * Math.PI : e > .625 * Math.PI && e <= .875 * Math.PI ? e = .75 * Math.PI : e < -.625 * Math.PI && e >= -.875 * Math.PI ? e = -.75 * Math.PI : e < -.125 * Math.PI && e >= -.375 * Math.PI && (e = -.25 * Math.PI), e
    },
    playerRotation: function() {
        return pointToRadian(player.x - game.camera.x, player.y - game.camera.y, game.input.x, game.input.y)
    },
    controllerRotation: function(e) {
        var a = window.innerWidth >= 1024 ? 1 : 1.25,
            t = touch.move.x,
            o = touch.move.y,
            s = pointToRadian(t, o, e.x, e.y),
            n = distance(t, o, e.x, e.y);
        return s = e.x < window.innerWidth / 2 && n > 4 ? s : null, s ? (n > 40 ? (button.moveStick.style.left = t / a - 40 * Math.cos(s) - 20 + "px", button.moveStick.style.top = o / a - 40 * Math.sin(s) - 20 + "px") : (button.moveStick.style.left = e.x / a - 20 + "px", button.moveStick.style.top = e.y / a - 20 + "px"), s) : null
    },
    attackerRotation: function(e) {
        var a = window.innerWidth >= 1024 ? 1 : 1.25,
            t = touch.attack.x,
            o = touch.attack.y,
            s = pointToRadian(t, o, e.x, e.y),
            n = distance(t, o, e.x, e.y);
        return s = e.x > window.innerWidth / 2 && n > 4 ? s : null, s && (n > 40 ? (button.attackStick.style.left = t / a - 40 * Math.cos(s) - 20 + "px", button.attackStick.style.top = o / a - 40 * Math.sin(s) - 20 + "px") : (button.attackStick.style.left = e.x / a - 20 + "px", button.attackStick.style.top = e.y / a - 20 + "px")), s
    }
}, Terrain = {
    initTemp: function() {
        for (var e = 0; e < temp.static.size; e++) {
            var a = shadows.create(0, 0, "shadow");
            a.visible = !1, a.anchor.set(.5), a.group = shadows, temp.static.shadows.push(a)
        }
        for (var e = 0; e < temp.dynamic.size; e++) {
            var a = shadows.create(0, 0, "shadow");
            a.visible = !1, a.anchor.set(.5), a.group = shadows, temp.dynamic.shadows.push(a)
        }
        for (var e = 0; e < temp.tree.size; e++) {
            var t = trees.create(0, 0, "tree");
            t.visible = !1, t.anchor.set(.5), t.season = "spring", temp.tree.objs.push(t)
        }
        for (var e = 0; e < temp.bush.size; e++) {
            var t = heroes.create(0, 0, "bush");
            t.visible = !1, t.anchor.set(.5), t.season = "spring", temp.bush.objs.push(t)
        }
        for (var e = 0; e < temp.rock.size; e++) {
            var t = rocks.create(0, 0, "rock", 1);
            t.visible = !1, t.anchor.set(.5), t.animations.add("rock", [0], 1, !1), t.animations.add("rock.dark", [1], 1, !1), t.animations.add("fence.horz", [2], 1, !1), t.animations.add("fence.vert", [3], 1, !1), temp.rock.objs.push(t)
        }
        for (var e = 0; e < temp.build.size; e++) {
            var t = new Build.House;
            t.visible = !1, t.anchor.set(.5), temp.build.objs.push(t)
        }
    },
    resetTemp: function() {
        for (var e in temp.static.shadows) temp.static.shadows[e].visible = !1;
        temp.static.count = 0;
        for (var e in temp.tree.objs) temp.tree.objs[e].visible = !1;
        temp.tree.count = 0;
        for (var e in temp.bush.objs) temp.bush.objs[e].visible = !1;
        temp.bush.count = 0;
        for (var e in temp.rock.objs) temp.rock.objs[e].visible = !1;
        temp.rock.count = 0;
        for (var e in temp.build.objs) temp.build.objs[e].visible = !1;
        temp.build.count = 0
    },
    setTempObject: function(e, a) {
        a.x = e.x, a.y = e.y, a.scale.set(e.scale), a.size = e.scale, a.visible = !0
    },
    updateTerrain: function(e, a) {
        if (e)
            for (var t in e) {
                var o = e[t];
                o.live && o.live(), a.push(o), o.visible = !0;
                var s, n, i = !1;
                switch (o.type) {
                    case "tree":
                        n = temp.tree;
                        break;
                    case "bush":
                        n = temp.bush;
                        break;
                    case "rock":
                    case "rock.dark":
                    case "fence.vert":
                    case "fence.horz":
                        n = temp.rock, i = !0;
                        break;
                    case "house":
                    case "church":
                        n = temp.build, i = !0
                }
                if (n.count < n.size && (s = n.objs[n.count], o.tempObj = s, i && s.animations.play(o.type), Terrain.setTempObject(o, s), n.count++, o.shadow && temp.static.count < temp.static.size)) {
                    var r = temp.static.shadows[temp.static.count];
                    r.x = o.x + o.shadow.spread, r.y = o.y + o.shadow.spread, r.scale.set(o.shadow.scale), r.visible = !0, r.group.remove(r), o.shadow.layer.add(r), r.group = o.shadow.layer, temp.static.count++
                }
            }
    },
    updateLOD: function() {
        for (var e in lastTerrains) lastTerrains[e].visible = !1;
        Terrain.resetTemp(), lastTerrains = [];
        var a = Math.floor(game.camera.x / Game.grid),
            t = Math.floor(game.camera.y / Game.grid),
            o = a + Math.floor(game.width / Game.grid),
            s = t + Math.floor(game.height / Game.grid);
        a--, t--, o += 2, s += 2;
        for (var n = {}, e = a; e < o; e++)
            for (var i = t; i < s; i++) {
                var r = terrains[e + "," + i];
                if (r) {
                    var d = Math.abs(o - e - (s - i));
                    n[d] || (n[d] = []), n[d].push(r)
                }
            }
        for (var e in n) n[e].forEach(function(e) {
            Terrain.updateTerrain(e, lastTerrains)
        })
    },
    resetDynamicShadows: function() {
        for (var e in temp.dynamic.shadows) temp.dynamic.shadows[e].visible = !1
    },
    randomTempShadow: function(e) {
        var a = temp.dynamic.shadows[temp.dynamic.count];
        !temp.dynamic.actives[e.id] && temp.dynamic.count < temp.dynamic.size && (temp.dynamic.actives[e.id] = a, a.target = e.id, a.x = e.x + e.shadow.spread, a.y = e.y + e.shadow.spread, a.scale.set(e.shadow.scale), a.visible = !0, a.group.remove(a), e.shadow.layer.add(a), a.group = e.shadow.layer, temp.dynamic.count++)
    }
}, Hero = function(e) {
    var a = new Origin(heroes, e.job + "." + e.team, e, {
        hit: !0,
        shadow: {},
        visible: !0
    });
    a.radius = 30, a.team = e.team, a.lastStep = {
        x: 0,
        y: 0
    }, a.last = {
        speed: 0,
        eater: 0,
        reflect: 0
    }, a.status = {}, a.quests = null, a.hp = e.hp;
    var t = Game.style;
    return t.fontSize = "13px", t.fontWeight = "bold", t.fill = "#FFFFFF", t.wordWrapWidth = a.width, a.name = game.add.text(e.x - a.radius, e.y - a.radius, "⬤ " + e.id.substring(1), t), a.name.anchor.set(.5), names.add(a.name), a.setName = function() {
        a.name.addColor(Game.baseColor[a.team], 0), a.name.addColor(Game.health[a.hp], 2)
    }, a.setName(), t.fontSize = "11px", t.fontWeight = "bold", t.fill = " #FFDB35", a.coinIcon = names.create(e.x, e.y, "coin"), a.coinIcon.anchor.set(.5, .5), a.coinIcon.scale.set(.7), a.coinIcon.visible = !1, a.coin = game.add.text(e.x - a.radius, e.y - a.radius, "", t), a.coin.anchor.set(.5), a.coin.visible = !1, names.add(a.coin), a.coinScore = 0, a.coinLength = 0, a.setCoin = function(e) {
        e.coin > 0 ? (a.coinIcon.visible = !0, a.coin.visible = !0, a.coin.setText("  " + e.coin), a.coinLength = e.coin.toString().length) : (a.coinIcon.visible = !1, a.coin.visible = !1), a.coinScore = e.coin, a == player && ui.shop.setCoin(e.coin)
    }, a.clearText = function() {
        a.textTime && clearTimeout(a.textTime), a.text && a.text.destroy(), a.textBubble && a.textBubble.destroy(), a.name.visible = !0, a.coinScore > 0 && (a.coinIcon.visible = !0, a.coin.visible = !0)
    }, a.setText = function(e) {
        a.text && a.clearText();
        var t = Game.style;
        t.fontSize = "13px", t.fontWeight = "normal", t.fill = "#444444", t.wordWrapWidth = 4 * a.width, t.backgroundColor = "rgba(255,255,255,1)", a.text = game.add.text(e.x, e.y, "\n  " + e.text + "  ", t), a.text.anchor.set(.5), a.text.lineSpacing = -16, a.textBubble = game.add.sprite(e.x, e.y, "bubble"), a.textBubble.anchor.set(.5, .5), delete t.backgroundColor, a.name.visible = !1, a.coinIcon.visible = !1, a.coin.visible = !1, a.textTime = setTimeout(function() {
            a.clearText()
        }, 6e3)
    }, a.weapon = new Origin(weapons, Game.jobWeapon[e.job], e, {
        visible: !0
    }), a.weapon.animations.add("attack"), a.weapon.events.onAnimationStart.add(function() {
        isDesktop && ("scientist" == e.job ? new Sound("attack." + e.job, a, .5) : new Sound("attack." + e.job, a))
    }), a.weapon.events.onAnimationComplete.add(function() {
        "shinobi" != e.job && (a.weapon.frame = 0)
    }), a.setFashion = function(e) {
        e && (a.fashion = new Origin(fruits, e, {
            x: a.x,
            y: a.y,
            rotation: a.rotation
        }, {
            visible: !0
        }), a.getFashionHit = function() {
            a.fashion.filters = [white], setTimeout(function() {
                a && (a.fashion.filters = null)
            }, 50)
        }, a.getFashionHit())
    }, a.attack = function() {
        a.weapon.animations.play("attack", 20, !1)
    }, a.hit = function() {
        a.fashion && a.getFashionHit(), a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.player" + e, a)
    }, a.clear = function() {
        new Sound("destroy", a), names.remove(a.coin), names.remove(a.name), names.remove(a.coinIcon), heroes.remove(a), weapons.remove(a.weapon), fruits.remove(a.fashion), a.clearText(), new Bone(a.x, a.y, a.visible), a.name.destroy(), a.coinIcon.destroy(), a.coin.destroy(), a.weapon.destroy(), a.fashion && a.fashion.destroy(), a.destroy(), delete creatures[a.id], a.radar && (radar.clear(), delete a.radar, a == radar.target && (radar.visible = !1, delete radar.target)), a = null
    }, a.liveAction = function(e) {
        if (a.hp != e.hp && (a.hp = e.hp, a.setName()), a.coinScore != e.coin && a.setCoin(e), e.text) {
            a.setText(e);
            var t = Math.ceil(6 * Math.random());
            new Sound("text" + t, a)
        }
        Reaction.normal(a, e), e.act.coin && new Coin(a.x, a.y), !a.fashion && e.fashion && a.setFashion("fashion." + e.fashion), a.fashion && (e.act.recover || e.act.coin || e.act.soul) && a.getFashionHit()
    }, a.liveData = function(e) {
        if (Game.teams.all++, Game.teams[a.team]++, e.act.back && (a.weapon.animations.stop(null, !0), a.weapon.frame = 0), e.act.revive) a.status.revive = new Revive(a.x, a.y, a), new Recover(a.x, a.y, "text.revive"), new Sound("revive", a, .5);
        else if (e.hp <= 0 || e.act.left) {
            player == a && a.clearUI(e), e.act.explode && (new Explode(a.x, a.y, 300), new Sound("bomb"));
            for (var t in shops) shops[t].shopIcon.alpha = 0;
            a.liveAction(e), a.clear()
        } else a == player ? a.playerUpdate(e) : checkTween(a, e, function() {
            a.liveAction(e), new Tween(a, a.id, {
                rotation: e.turn,
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                rotation: e.turn,
                x: e.x,
                y: e.y
            }, !0), waterStep(a, e)
        }, function() {
            a.x = e.x, a.y = e.y, new Radar(a.x, a.y, Game.baseColor[a.team])
        })
    }, a.live = function(e) {
        a.liveData(e)
    }, creatures[e.id] = a, a
};
var flags = [];
Player = function(e) {
    var a = new Hero(e);
    return a.radar = radar, radar.visible = !0, radar.target = a, a.items = {
        weapon: "",
        equip: "",
        upgrade: "",
        usable: ""
    }, a.live = function(e) {
        var t = !1;
        for (var o in shops) shops[o].team == a.team && distance(shops[o].x, shops[o].y, a.x, a.y) < 200 ? (shops[o].shopIcon.alpha = 1, t = !0) : shops[o].shopIcon.alpha = 0;
        t || (last.shopOn = !1, a.shopping = !1, body.contains(ui.shop) && body.remove(ui.shop));
        var s = !1;
        questBuilds.forEach(function(e) {
            0 == e.frame && distance(e.x, e.y, a.x, a.y) < 200 ? (e.quest.x = e.x, e.quest.y = e.y, e.questIcon.x = e.x, e.questIcon.y = e.y, e.questIcon.alpha = 1, s = !0) : e.questIcon.alpha = 0
        }), s || (last.questOn = !1, a.questing = !1, body.contains(ui.board) && body.remove(ui.board)), a.liveData(e)
    }, a.clearUI = function(e) {
        player.shopping && (player.shopping = !1, body.remove(ui.shop)), player.questing && (player.questing = !1, body.remove(ui.board)), setTimeout(function() {
            ui.replay(), ui.rank.setScore(e.coin), ui.rank.incrPlays(), isDesktop || body.append(ui.rank)
        }, 1e3)
    }, a.playerUpdate = function(e) {
        a.liveAction(e);
        var t = {
            x: e.x,
            y: e.y
        };
        new Tween(a, a.id, t), Terrain.randomTempShadow(a), waterStep(a, e)
    }, a
}, Game.items = [{
    name: "Master Sword",
    type: "weapon",
    value: "weapon.master",
    cost: 5,
    desc: "Sword with more attack damage."
}, {
    name: "Soul Stealer",
    type: "weapon",
    value: "weapon.stealer",
    cost: 5,
    desc: "Sword with 40% chance for stealing 1 HP from an enemy."
}, {
    name: "Burning Edge",
    type: "weapon",
    value: "weapon.edge",
    cost: 5,
    desc: "Sword with 40% chance for burning an enemy."
}, {
    name: "Frostbite",
    type: "weapon",
    value: "weapon.frost",
    cost: 5,
    desc: "Sword that freezes any enemy for 1 sec."
}, {
    name: "Speed Boots",
    type: "equip",
    value: "equip.speed",
    cost: 4,
    desc: "Boots with more movement speed."
}, {
    name: "Swift Boots",
    type: "equip",
    value: "equip.swift",
    cost: 12,
    desc: "Boots with super movement speed."
}, {
    name: "Great Mail",
    type: "equip",
    value: "equip.mail",
    cost: 5,
    desc: "Armor with 28% chance for blocking attack."
}, {
    name: "Brave Heart",
    type: "upgrade",
    value: "upgrade.heart1",
    cost: 3,
    desc: "The crystal upgrades max HP by 1."
}, {
    name: "Fearless Heart",
    type: "upgrade",
    value: "upgrade.heart2",
    cost: 7,
    desc: "The crystal upgrades max HP by 2."
}, {
    name: "Sky Heart",
    type: "upgrade",
    value: "upgrade.heart3",
    cost: 13,
    desc: "The crystal upgrades max HP by 3."
}, {
    name: "Ocean Heart",
    type: "upgrade",
    value: "upgrade.heart4",
    cost: 24,
    desc: "The crystal upgrades max HP by 4."
}, {
    name: "Black Heart",
    type: "upgrade",
    value: "upgrade.heart5",
    cost: 36,
    desc: "The crystal upgrades max HP by 5."
}, {
    name: "Bastion",
    type: "tower",
    value: "tower.bastion",
    cost: 5,
    desc: "Upgrades outpost into bastion and improves defense by 10."
}, {
    name: "Fortress",
    type: "tower",
    value: "tower.fort",
    cost: 12,
    desc: "Upgrades outpost into fortress and improves defense by 20."
}, {
    name: "Giant Core",
    type: "usable",
    value: "usable.core",
    cost: 999,
    desc: "Use the heart of giant to revive yourself before dying."
}, {
    name: "Sickle",
    type: "usable",
    value: "usable.sickle",
    cost: 5,
    desc: "Tool that helps to get berry x2."
}, {
    name: "Bomb",
    type: "usable",
    value: "usable.bomb",
    cost: 1,
    desc: "Explode yourself when dying."
}, {
    name: "Potion",
    type: "usable",
    value: "usable.potion",
    cost: 1,
    desc: "Use potion to retore 4 HP."
}], Fruit = function(e) {
    var a = new Origin(fruits, "fruit", e);
    return a.rotation = 0, a.clear = function() {
        fruits.remove(a), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        checkTween(a), e.act && e.act.collided && a.clear()
    }, creatures[e.id] = a, a
}, Item = function(e, a) {
    var t, o = {
        hit: !0,
        shadow: {}
    };
    switch (e) {
        case "box":
            t = new Origin(plants, e, a, o);
            break;
        case "claw":
            t = new Origin(plants, e, a, o), t.rotation = Math.PI / 2;
            break;
        case "core":
            o.shadow = {
                scale: .8,
                spread: 13
            }, t = new Origin(plants, e, a, o), t.rotation = 0;
            break;
        case "crystal.blue":
        case "crystal.green":
        case "crystal.yellow":
            o.shadow.scale = .55, o.shadow.spread = 11, t = new Origin(plants, e, a, o), t.rotation = 0
    }
    return t.clear = function() {
        plants.remove(t), t.destroy(), delete creatures[t.id], t = null
    }, t.live = function(e) {
        checkTween(t), e.act && e.act.collided && t.clear()
    }, checkTween(t), new Sound("close", t), creatures[a.id] = t, t
}, Treasure = function(e) {
    var a = new Origin(weapons, "treasure", e, {
        hit: !0,
        shadow: {
            layer: rides
        }
    });
    return a.clear = function() {
        weapons.remove(a), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        checkTween(a, e, function() {
            if (e.act.hit)
                if (isDesktop) {
                    new Hit(a.x, a.y);
                    var t = Math.ceil(3 * Math.random());
                    new Sound("hit.skeleton" + t, a)
                } else new Bone(a.x, a.y, !0)
        }), e.act.collided && a.clear()
    }, checkTween(a), new Sound("close", a), creatures[e.id] = a, a
}, FlagZone = function(e, a) {
    var t = game.add.graphics(e.x, e.y);
    t.beginFill(Game.baseHexColor[a], .5), t.drawCircle(0, 0, 1), t.endFill(), t.anchor.set(.5), zones.add(t), e.zoning = !0, checkTween(e, null, function() {
        var a = game.add.tween(t).to({
            alpha: 0
        }, 2e3, Phaser.Easing.None, !0);
        game.add.tween(t.scale).to({
            x: 400,
            y: 400
        }, 2e3, Phaser.Easing.None, !0);
        a.onComplete.add(function() {
            zones.remove(t), t.destroy(), e.zoning = !1
        }, this)
    })
}, RadarFlag = function(e) {
    var a = game.add.sprite(0, 0, "radar." + e);
    return a.update = function(e, t) {
        radarUpdate(e, t, 24, function(e, t, o, s) {
            a.x = e - 24, a.y = t - 24, radar.addChild(a)
        })
    }, a
}, RadarCustom = function(e) {
    var a = game.add.sprite(0, 0, "legend." + e);
    return a.update = function(e, t) {
        radarUpdate(e, t, 15, function(e, t, o, s) {
            a.x = e - 15, a.y = t - 15, radar.addChild(a)
        })
    }, a
}, Flag = function(e) {
    var a = new Origin(heroes, "flag." + e.team, e);
    return a.visible = !0, a.live = function(e) {
        checkTween(a, e, function() {
            e.act.hilight && !a.zoning && new FlagZone(a, e.team), new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), radar.removeChild(legend.flags[e.team])
        }, function() {
            legend.flags[e.team].update(a.x, a.y)
        })
    }, creatures[e.id] = a, a
}, Campfire = function(e) {
    var a = new Origin(heroes, "campfire", e);
    return a.visible = !0, a.rotation = 0, a.live = function(e) {
        checkTween(a, e, function() {
            new Flame(e.x, e.y, 0)
        })
    }, new Light(e.x, e.y), creatures[e.id] = a, a
}, Game.style = {
    font: "Montserrat",
    fill: "#fff",
    wordWrap: !1,
    wordWrapWidth: null,
    align: "center"
}, Game.health = ["#FF0000", "#FF3333", "#FF6666", "#FF9999", "#FFCCCC", "#FFFFFF", "#FFFF00", "#66FF33", "#00FFFF", "#0000FF", "#000000"], Game.baseColor = {
    noflag: "#FFFFFF",
    none: "#FFFFFF",
    A: "#EE5A48",
    B: "#3675BB",
    C: "#DBA234",
    D: "#9059C6"
}, Game.baseHexColor = {
    none: 16777215,
    A: 15620680,
    B: 3569083,
    C: 14393908,
    D: 9460166
}, Game.baseCapture = {
    noflag: "No Flag",
    none: "- Neutral",
    A: "+ Ember",
    B: "+ Zephyr",
    C: "+ Terra",
    D: "+ Mystic"
}, Origin = function(e, a, t, o) {
    var s, n, i = t.x,
        r = t.y,
        d = !1;
    return o && (i += o.x || 0, r += o.y || 0, n = o.radius || null, d = o.visible || !1), e ? s = e.create(i, r, a) : (s = game.add.sprite(i, r, a), d = !0), t.id && (s.id = t.id), t.alpha && (s.alpha = t.alpha), t.rotation && (s.rotation = t.rotation), t.scale && s.scale.set(t.scale), t.team && (s.team = t.team), s.radius = n || 30, s.anchor.set(.5), s.visible = d, o && (o.hit && (s.getHit = function() {
        s.filters = [white], setTimeout(function() {
            s && (s.filters = null)
        }, 50)
    }, s.getHit()), o.shadow && (s.shadow = {
        layer: o.shadow.layer || shadows,
        scale: o.shadow.scale || 1,
        spread: o.shadow.spread || 15
    })), s
}, Tree = function(e) {
    var a = e;
    return a.scale = e.scale / 2, a.shadow = {
        layer: shadows2,
        scale: 2 * e.scale,
        spread: 15 * e.scale * 2
    }, a.live = function() {
        var e = a.tempObj;
        e && e.season != Game.season && (tweenHSL(e, trees, Game.seasons[e.season].tree, Game.seasons[Game.season].tree, 3e3), e.season = Game.season)
    }, terrainGrid(a), a
}, Rock = function(e, a) {
    var t = e;
    return t.shadow = {
        layer: shadows2,
        scale: e.scale,
        spread: 15 * e.scale
    }, terrainGrid(t), t
}, Fence = function(e) {
    var a = e;
    return a.scale = 1.25, terrainGrid(a), a
}, Bush = function(e) {
    var a = e;
    return a.scale = 1.2, a.shadow = {
        layer: shadows,
        scale: 1.1,
        spread: 15
    }, a.live = function() {
        var e = a.tempObj;
        e && e.season != Game.season && (tweenHSL(e, heroes, Game.seasons[e.season].bush, Game.seasons[Game.season].bush, 3e3), e.season = Game.season)
    }, terrainGrid(a), a
}, Grass = function(e) {
    grass.beginFill(e.color, e.alpha), grass.drawRect(e.x, e.y, e.width, e.height)
}, Soil = function(e) {
    grass.beginFill(e.color, e.alpha / 2), grass.drawRect(e.x - .125 * e.width, e.y - .125 * e.height, 1.25 * e.width, 1.25 * e.height), new Grass(e)
}, Clay = function(e) {
    grass.beginFill(e.color, e.alpha / 2), grass.drawRect(e.x - .125 * e.width, e.y - .125 * e.height, 1.25 * e.width, 1.25 * e.height), grass.beginFill(e.color, e.alpha / 4), grass.drawRect(e.x - .25 * e.width, e.y - .25 * e.height, 1.5 * e.width, 1.5 * e.height), grass.beginFill(e.color, e.alpha / 8), grass.drawRect(e.x - .5 * e.width, e.y - .5 * e.height, 2 * e.width, 2 * e.height), new Grass(e)
}, Water = function(e) {
    var a = game.add.sprite(e.x, e.y, "soil");
    return a.width = e.width, a.height = e.height, soils.add(a), waterMask.drawRect(e.x, e.y, e.width, e.height), waters.push(a), a
}, Ostrich = function(e) {
    var a = new Origin(rides, "ostrich", e, {
        hit: !0,
        shadow: {
            layer: zones,
            scale: 1.2,
            spread: 20
        }
    });
    return a.lastStep = {
        x: 0,
        y: 0
    }, a.status = {}, a.weapon = new Origin(zones, "ostrich.body", e), a.weapon.animations.add("ostrich.body", [0, 1, 2, 3], 1, !1), a.weapon.animations.play("ostrich.body", 6, !0), a.hit = function() {
        a.getHit(), new Hit(a.x, a.y);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.zombie" + e, a)
    }, a.clear = function() {
        rides.remove(a), zones.remove(a.weapon), new Bone(a.x, a.y, a.visible), a.weapon.destroy(), a.destroy(), delete creatures[a.id], a = null
    }, a.live = function(e) {
        checkTween(a, e, function() {
            Reaction.normal(a, e), a.status.stun ? (new Tween(a, a.id, {
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                x: e.x,
                y: e.y
            }, !0)) : (new Tween(a, a.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), new Tween(a.weapon, a.id + "w", {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }, !0), e.act.riding || waterStep(a, e))
        })
    }, creatures[e.id] = a, a
}, Game.npc = {
    types: {
        "npc.male": "Villager",
        "npc.female": "Villager",
        father: "Father",
        princess: "Princess"
    },
    weapons: {
        "npc.male": "npc.body",
        "npc.female": "npc.body",
        father: "npc.body",
        princess: "princess.body"
    }
}, NPC = function(e, a) {
    var t = new Origin(zombies, e.type, e, {
        hit: !0,
        shadow: {}
    });
    t.radius = 30, t.lastStep = {
        x: 0,
        y: 0
    }, t.status = {}, t.hp = e.hp;
    var o = Game.style;
    return o.fontSize = "13px", o.fontWeight = "bold", o.fill = "#FFFFFF", o.wordWrapWidth = t.width, t.name = game.add.text(e.x - t.radius, e.y - t.radius, Game.npc.types[e.type], o), t.name.anchor.set(.5), names.add(t.name), t.setName = function() {
        t.name.addColor(Game.health[t.hp], 0)
    }, t.setName(), t.clearText = function() {
        t.textTime && clearTimeout(t.textTime), t.text && t.text.destroy(), t.textBubble && t.textBubble.destroy(), t.name.visible = !0
    }, t.setText = function(e) {
        t.text && t.clearText();
        var a = Game.style;
        a.fontSize = "13px", a.fontWeight = "normal", a.fill = "#444444", a.wordWrapWidth = 4 * t.width, a.backgroundColor = "rgba(255,255,255,1)", t.text = game.add.text(e.x, e.y, "\n  " + e.text + "  ", a), t.text.anchor.set(.5), t.text.lineSpacing = -16, t.textBubble = game.add.sprite(e.x, e.y, "bubble"), t.textBubble.anchor.set(.5, .5), delete a.backgroundColor, t.name.visible = !1, t.textTime = setTimeout(function() {
            t.clearText()
        }, 6e3)
    }, t.weapon = new Origin(weapons, Game.npc.weapons[e.type], e), t.weapon.animations.add("attack"), t.weapon.events.onAnimationComplete.add(function() {
        t.weapon.frame = 0
    }), t.attack = function() {
        t.weapon.animations.play("attack", 20, !1), new Sound("attack.warrior")
    }, t.hit = function() {
        t.getHit(), new Hit(t.x, t.y);
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.player" + e, t)
    }, t.clear = function() {
        var e = Math.ceil(3 * Math.random());
        new Sound("hit.player" + e, t), zombies.remove(t), weapons.remove(t.weapon), names.remove(t.name), t.clearText(), new Bone(t.x, t.y, t.visible), t.weapon.destroy(), t.name.destroy(), t.destroy(), delete creatures[t.id], t = null
    }, t.live = function(e) {
        if (t.hp != e.hp && (t.hp = e.hp, t.setName()), e.text) {
            t.setText(e);
            var o = Math.ceil(6 * Math.random());
            new Sound("text" + o, t)
        }
        e.hp <= 0 ? (e.act.burn && new Burn(t), t.clear()) : checkTween(t, e, function() {
            Reaction.normal(t, e), e.act.heal && (t.zone = game.add.graphics(e.x, e.y), t.zone.beginFill(16626153, .1), t.zone.drawCircle(0, 0, 1), t.zone.endFill(), t.zone.anchor.set(.5), zones.add(t.zone), game.add.tween(t.zone).to({
                alpha: 0
            }, 1e3, Phaser.Easing.None, !0), game.add.tween(t.zone.scale).to({
                x: 500,
                y: 500
            }, 1e3, Phaser.Easing.None, !0)), t.status.stun ? (new Tween(t, t.id, {
                x: e.x,
                y: e.y
            }), new Tween(t.weapon, t.id + "w", {
                x: e.x,
                y: e.y
            }, !0)) : (new Tween(t, t.id, {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }), new Tween(t.weapon, t.id + "w", {
                rotation: e.rotation,
                x: e.x,
                y: e.y
            }, !0), waterStep(t, e))
        }, function() {
            a && new Radar(t.x, t.y, "#FFFFFF")
        })
    }, creatures[e.id] = t, t
}, Tower = function(e) {
    function a() {
        last.shopOn = !1;
        for (var e in shops)
            if (shops[e].team == player.team) {
                var a = game.camera.x + game.input.x,
                    o = game.camera.y + game.input.y;
                a > shops[e].x - 50 && shops[e].x + 50 > a && o > shops[e].y - 50 && shops[e].y + 50 > o && 1 == shops[e].shopIcon.alpha && (last.shopOn = !0)
            }
        player.hp > 0 && last.shopOn && (game.input.activePointer.isDown || game.input.pointer1.isDown) && distance(t.x, t.y, player.x, player.y) < 200 && player.team == t.team && (t.shopIcon.alpha = 0, player.shopping = !0, ui.shop.setCoin(player.coinScore, t.id), body.append(ui.shop), new Sound("shop"))
    }
    e.x += 25, e.y += 25, e.scale = 2.5;
    var t = towers.create(e.x, e.y, "tower", 1);
    t.radius = 30, t.scale.set(e.scale / 2), t.anchor.set(.5), t.id = e.id, t.team = e.team, t.animations.add("none", [0], 1, !1), t.animations.add("A", [1], 1, !1), t.animations.add("B", [2], 1, !1), t.animations.add("C", [3], 1, !1), t.animations.add("D", [4], 1, !1), t.animations.add("hit", [5], 1, !1), t.animations.play(e.team), isDesktop && (t.zone = game.add.graphics(e.x, e.y), t.zone.beginFill(65535, .2), t.zone.drawCircle(0, 0, 1), t.zone.endFill(), t.zone.anchor.set(.5), zones.add(t.zone), game.add.tween(t.zone).to({
        alpha: 0
    }, 2e3, Phaser.Easing.None, !0, 1, 1, !1).loop(!0), game.add.tween(t.zone.scale).to({
        x: 500,
        y: 500
    }, 2e3, Phaser.Easing.None, !0, 1, 1, !1).loop(!0)), legend.towers[e.id] = new RadarCustom("tower"), t.shopIcon = new Origin(towers, "shop", e, {
        visible: !0
    }), t.shopIcon.scale.set(1), t.shopIcon.alpha = 0, t.shop = game.add.button(e.x, e.y, "shop", null, this, 1, 0, 0), t.shop.input.useHandCursor = !1, t.shop.anchor.set(.5), t.shop.scale.set(1.25), t.shop.alpha = 0, t.shop.onInputDown.add(a, this);
    var o = Game.style;
    return o.fontSize = "14px", o.fontWeight = "bold", o.fill = "#ffffff", o.wordWrapWidth = t.width, t.stat = {
        armor: 0
    }, t.armor = towers.create(e.x - 16, e.y - 70, "armor"), t.armor.alpha = .75, t.armor.anchor.set(.5), t.armorNum = game.add.text(e.x + 10, e.y - 67, "0", o), t.armorNum.anchor.set(.5), towers.add(t.armorNum), e.x -= 25, e.y -= 25, t.shadow = {
        layer: shadows3,
        scale: 3.1,
        spread: 40
    }, t.live = function(e) {
        Game.towers[e.team]++, t.x > game.camera.x - 80 && t.y > game.camera.y - 80 && t.x < game.camera.x + game.width + 80 && t.y < game.camera.y + game.height + 80 ? (Terrain.randomTempShadow(t), t.team != e.team && new Sound("capture"), e.act.hit && new Sound("tower"), "none" == e.team && e.stat.hp <= -1 && new Capture(t.x, t.y, t.width, "noflag"), radar.removeChild(legend.towers[e.id])) : legend.towers[e.id].update(t.x, t.y), t.items = e.items, t.stat.armor != e.stat.hp && (t.stat.armor = e.stat.hp, t.armorNum.setText(e.stat.hp)), e.act.hit && (t.animations.play("hit", 10, !0), setTimeout(function() {
            t.animations.play(e.team)
        }, 50)), t.team != e.team && (t.team = e.team, new Capture(t.x, t.y, t.width, e.team), t.animations.play(e.team)), isDesktop || checkTween(t)
    }, new Light(e.x, e.y), shops[e.id] = t, creatures[e.id] = t, t
}, SoundVolume = function(e, a) {
    playSound(e).volume = a
}, Sound = function(e, a, t) {
    isDesktop && (a && a.visible ? t ? new SoundVolume(e, t) : playSound(e) : a || playSound(e))
};
var button = {};
Text = function() {
    var e = createDOM('<input class="text" style="visibility:hidden" placeholder="Message" maxlength="20">');
    return e.toggle = !1, e.onkeyup = function(e) {
        13 == e.keyCode && last.enter < Date.now() - 200 && ui.text.enter()
    }, e.bubble = createDOM('<div class="bubble"></div>'), e.bubble.onclick = function() {
        ui.text.enter()
    }, isDesktop || (e.bubble.style.cssText = "background-image:url(" + Server.path + "assets/ui/bubble.mob.svg);width:35px;height:35px"), e.enter = function() {
        if (ui.text.toggle) {
            ui.text.bubble.style.visibility = "visible", ui.text.blur(), ui.text.style.visibility = "hidden", ui.text.toggle = !1;
            var e = ui.text.value;
            "" != e.trim() && send(Event.TEXT, {
                m: e.substring(0, 20)
            }), ui.text.value = ""
        } else body.contains(ui.ads) || (ui.text.bubble.style.visibility = "hidden", ui.text.style.visibility = "visible", ui.text.focus(), ui.text.toggle = !0);
        last.enter = Date.now()
    }, e
}, Stat = function() {
    return createDOM('<div class="stat">    <span *="A" class="A">0</span><span *="B" class="B">0</span><span *="C" class="C">0</span><span *="D" class="D">0</span>    </div>')
}, ShopItem = function(e) {
    var a = createDOM('<div class="item" style="background-image:url(' + Server.path + "assets/items/shop/" + e.value + '.png)"></div>');
    return a.data = e, a
}, Shop = function() {
    function e() {
        last.shopOn = !1, player.shopping = !1, body.remove(ui.shop), new Sound("close")
    }
    var a = createDOM('<div class="shop">    <div *="bg" class="bg"></div>    <div *="box" class="shop-bg"></div>    <div *="left" class="shop-left"><div *="name" class="shop-name"></div><div *="leftBox" class="shop-box"></div></div><div *="right" class="shop-right"><div *="rightBox" class="shop-box"></div></div>    <div *="coinHTML" class="coin"></div>    <button *="buy" class="buy"></button>    <button *="close" class="close"></button>    </div>');
    a.bg.onclick = e, a.setCoin = function(e, t) {
        t && (a.tower = t), a.coin = e, a.coinHTML.innerHTML = '<img src="' + Server.path + 'assets/ui/coin.svg"> x<span>' + e + "</span>";
        for (var o in a.items) a.items[o].removeAttribute("owned");
        if (player)
            for (var o in player.items) player.items[o] && a.items[o + "." + player.items[o]].setAttribute("owned", !0);
        var s = creatures[a.tower];
        s && (a.items["tower." + s.items.armor] && a.items["tower." + s.items.armor].setAttribute("owned", !0), a.items["tower." + s.items.food] && a.items["tower." + s.items.food].setAttribute("owned", !0)), a.items[a.data.value].click()
    }, a.close.onclick = e, a.buy.onclick = function() {
        send(Event.BUY, {
            tower: a.tower,
            item: a.data.value
        }), "usable.potion" == a.data.value && (last.shopOn = !1, player.shopping = !1, body.remove(ui.shop))
    }, a.items = {};
    for (var t in Game.items) {
        var o = new ShopItem(Game.items[t]);
        o.onclick = function() {
            for (var e in a.rightBox.childNodes) a.rightBox.childNodes[e].className = "item";
            this.className = "item pick", a.data = this.data, a.name.innerHTML = '<img src="' + Server.path + "assets/items/types/" + this.data.type + '.svg"> ' + this.data.name, a.leftBox.textContent = this.data.desc, this.hasAttribute("owned") ? (a.buy.className = "bought", a.buy.textContent = "Owned") : (a.buy.className = "buy", a.buy.innerHTML = "Buy<span>" + (this.data.cost >= 999 ? "-" : this.data.cost) + "</span>"), this.hasAttribute("owned") || "string" == typeof this.data.cost || a.coin < this.data.cost ? a.buy.disabled = !0 : a.buy.disabled = !1
        }, a.items[Game.items[t].value] = o, a.rightBox.append(o)
    }
    return a.rightBox.firstChild.click(), a
}, Selector = function(e) {
    var a = createDOM('<div class="selector">    <div *="left" class="ui-left"></div>    </div>');
    a.i = 1, a.list = [];
    for (var t in e) {
        var o = createDOM("<img>");
        o.src = Server.path + "assets/" + ui.team + "/model." + e[t] + ".png?8", o.data = e[t], a.list.push(o), a.append(o)
    }
    if (a.right = createDOM('<div class="ui-right"></div>'), a.append(a.right), a.desc = createDOM('<div class="ui-desc">    <div *="first" class="ui-desc-item"></div><div *="second" class="ui-desc-item"></div></div>'), a.append(a.desc), a.clear = function() {
            for (var e in a.list) a.list[e].style.display = "none", a.list[e].src = "#";
            var t = a.list[a.i];
            t.style.display = "inline-block", ui.job = t.data, ui.current.right.setAttribute("job", Game.jobDesc[ui.job][0]), t.src = Server.path + "assets/" + ui.team + "/model." + ui.job + ".png?8", a.current = t, ui.playable(), a.desc.first.setAttribute("head", Game.jobDesc[ui.job][1]),
                a.desc.first.setAttribute("desc", Game.jobDesc[ui.job][2]), a.desc.second.setAttribute("head", Game.jobDesc[ui.job][3]), a.desc.second.setAttribute("desc", Game.jobDesc[ui.job][4])
        }, a.left.onclick = function() {
            a.i = a.i - 1 >= 0 ? a.i - 1 : a.list.length - 1, a.clear()
        }, a.right.onclick = function() {
            a.i = a.i + 1 > a.list.length - 1 ? 0 : a.i + 1, a.clear()
        }, Game.jobWeapon[ui.lastJob])
        do {
            a.right.click()
        } while (ui.job != ui.lastJob);
    return a
}, StartUI = function() {
    var e = createDOM('<div class="container">    <div *="logo" id="logo"></div>    <div *="left" class="left" style="display:inline-block">    <select *="server" class="server"></select>    <button *="spectator" class="spectator" title="Spectator Mode"></button><input *="name" maxlength="10" placeholder="Name"><br>    <button *="play" class="play"></button>    <a *="help" class="help-icon">How to Play?</a>    </div>    <div *="right" class="right" style="display:inline-block">    <div *="top" class="top"></div>    </div>    </div>');
    for (var a in Game.servers)
        for (var t in Game.servers[a]) {
            var o = createDOM("<option>" + Game.serverNames[a] + (Number(t) + 1) + "</option>"),
                s = a + "." + t;
            o.value = s, o.name = Game.serverNames[a] + (Number(t) + 1), server == s && (o.selected = !0), e.server.append(o)
        }
    return e.server.onchange = function() {
        localStorage.setItem("serv", e.server.value), ui.reload()
    }, e.name.value = localStorage.getItem("name") || "", e.name.onkeyup = function(a) {
        ui.playable(), 13 == a.keyCode && e.name.blur()
    }, e.help.onclick = function() {
        body.append(ui.help)
    }, e.mute = createDOM('<button class="mute-icon"></button>'), e.mute.on = !0, e.mute.onclick = function() {
        e.mute.on = !e.mute.on, e.mute.on ? (game.sound.mute = !1, e.mute.style.backgroundImage = "url(assets/ui/mute.svg)", localStorage.removeItem("muted")) : (game.sound.mute = !0, e.mute.style.backgroundImage = "url(assets/ui/muted.svg)", localStorage.setItem("muted", !0))
    }, e.reload = createDOM('<button class="reload-icon"></button>'), e.reload.onclick = function() {
        location.reload(!0)
    }, e.play.onclick = function() {
        localStorage.setItem("name", e.name.value), startAds(), isDesktop || body.remove(ui.rank)
    }, e.A = createDOM('<button class="selected" style="background:#DE4330"></button>'), e.A.team = "A", e.A.onclick = function() {
        ui.team = "A", e.selector.current.src = Server.path + "assets/" + ui.team + "/model." + ui.job + ".png?8", e.A.className = "selected", e.B.className = "", e.C.className = "", e.D.className = "", ui.playable()
    }, e.B = createDOM('<button style="background:#2960AD"></button>'), e.B.team = "B", e.B.onclick = function() {
        ui.team = "B", e.selector.current.src = Server.path + "assets/" + ui.team + "/model." + ui.job + ".png?8", e.A.className = "", e.B.className = "selected", e.C.className = "", e.D.className = "", ui.playable()
    }, e.C = createDOM('<button style="background:#DBA234"></button>'), e.C.team = "C", e.C.onclick = function() {
        ui.team = "C", e.selector.current.src = Server.path + "assets/" + ui.team + "/model." + ui.job + ".png?8", e.A.className = "", e.B.className = "", e.C.className = "selected", e.D.className = "", ui.playable()
    }, e.D = createDOM('<button style="background:#9059C6"></button>'), e.D.team = "D", e.D.onclick = function() {
        ui.team = "D", e.selector.current.src = Server.path + "assets/" + ui.team + "/model." + ui.job + ".png?8", e.A.className = "", e.B.className = "", e.C.className = "", e.D.className = "selected", ui.playable()
    }, isDesktop && (! function() {
        e.info = createDOM('<div class="info">      <a href="http://blockergame.com" target="_blank">BLOCKERGAME.COM</a>&nbsp;&nbsp;-&nbsp;&nbsp;v2.3.5<br><div>      <a onclick="body.append(ui.credit)">About Game</a>      </div><div class="apps extension" onclick="chrome.webstore.install()"><img src="' + Server.path + 'assets/ui/publish/chrome-web-store.png"></div>      <a target="_blank" href="https://play.google.com/store/apps/details?id=com.blockergame.c1473481511686" class="apps">      <img class="focus" src="' + Server.path + 'assets/ui/publish/play-store.png"></a>      </div>'), e.append(e.info)
    }(), e.log = createDOM('<div class="log">      <b>Change Log</b><br>      2.3.5 - New Monsters<br>      2.3.0 - The Church<br>      2.2.17 - Frostbite upgrades 0.8 -> 1 sec<br>      2.2.0 - New Costume Bag<br>      2.1.4 - New Spectator Mode<br>      2.0.0 - Nightmares Updates<br>      -------------------------------<br>      1.9.0 - New gameplay with flags<br>      <a href="http://blockergame.com/changelog.txt" target="_blank">See More</a>      </div>'), e.append(e.log)), e.spectator.onclick = function() {
        ui.spectator.spectate(), ui.spectator.body.click()
    }, e
}, Credit = function() {
    var e = createDOM('<div class="help start"><button *="close" class="help-close"></button><div *="body" class="help-body"></div></div>');
    return e.close.onclick = function() {
        e.parentNode.remove(e)
    }, e.body.innerHTML = '<div class="help-content help-left"><h1>Created by</h1><br><ul><li><a href="#" target="_blank">Witsaraz Zuninhong (Teppo)</a></li></ul><br><br><h1>Sound by</h1><br><ul><li><a href="http://bdcraft.net/bdcraft-sounds-pack" target="_blank">BDCraft Sounds Pack</a></li><li><a href="http://dustyroom.com/casual-game-sfx-freebie/" target="_blank">Casual Game SFX Freebie</a></li><li><a href="http://www.freesfx.co.uk/" target="_blank">FreeSFX (Exciting Race Tune)</a></li></ul><br><br></div><div class="help-content help-left"><h1>Thank You :)</h1><br><ul></ul><br><br><div>', e
}, Help = function() {
    var e = createDOM('<div class="help start"><button *="close" class="help-close"></button><div *="body" class="help-body"></div></div>');
    return e.close.onclick = function() {
        body.remove(e)
    }, e.content1 = createDOM('<div class="help-content">    <h1>Controls</h1><br><br><br><img src="' + Server.path + 'assets/ui/help/controls.svg"><p></p><br>    </div>'), e.content2 = createDOM('<div class="help-content"><h1>Objectives</h1><br><ul><li><i style="background-image:url(assets/ui/help/survive.svg)"></i><div><span style="color:#FFCA1C">Fight</span> against other colors <p class="team-A"></p><p class="team-B"></p><p class="team-C"></p><p class="team-D"></p></div></li><li><i style="background-image:url(assets/ui/help/flags.svg)"></i><div>Find your team <span style="color:#FFCA1C">Flag</span>, only who keeps the flag can <span style="color:#FFCA1C">Capture</span> an outpost</div></li><li><i style="background-image:url(assets/ui/help/capture.svg)"></i><div><span style="color:#FFCA1C">Defend</span> your outpost</div></li><li><i style="background-image:url(assets/ui/help/kill.svg)"></i><div><span style="color:#DE4330">Kill</span> enemies and get their <span style="color:#FFCA1C">coins</span></div></li><li><i style="background-image:url(assets/ui/help/quest.svg)"></i><div>Do <span style="color:#FFCA1C">Quests</span></div></li></ul><br>    </div>'), e.content3 = createDOM('<div class="help-content">    <h1>Guides</h1><br><ul class="center">    <li><img src="' + Server.path + 'assets/ui/help/shop.svg"><br><br>Item shop is on your outpost</li><br><br>    <li><img src="' + Server.path + 'assets/ui/help/equipment.svg"><br><br>You can equip only 1 item/type</li><br><br>    <li><img src="' + Server.path + 'assets/ui/help/health.svg"><br><br>Your color name is your health</li>    </ul><br><br>    </div>'), nextTick(function() {
        isDesktop || (ui.help.content1.childNodes[4].src = Server.path + "assets/ui/help/controls2.svg", ui.help.content1.childNodes[5].innerHTML = "<br>&nbsp;Left Hand&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;Right Hand")
    }), e.body.append(e.content1), e.body.append(e.content2), e.body.append(e.content3), e
}, LandscapeMode = function() {
    return createDOM('<div class="landscape"></div>')
};
var ui = {
    reload: function() {
        window.location = window.location.href.split("#")[0]
    },
    playable: function() {
        ui.current && ("" == ui.current.name.value.trim() ? ui.current.play.disabled = !0 : ui.current.play.disabled = !1)
    },
    start: function() {
        ui.team = localStorage.getItem("team") || Game.team[Math.floor(3 * Math.random())], ui.lastJob = localStorage.getItem("job") || "warrior", ui.current = new StartUI, ui.current.selector = new Selector(Game.jobs), ui.current.right.append(ui.current.selector), ui.text = new Text, ui.stat = new Stat, ui.score = new Score, ui.rank = new Rank, ui.bag = new CostumeBag, ui.leaderboard = new Leaderboard, ui.spectator = new Spectator, ui.quest = new Quest, ui.board = new Board, ui.shop = new Shop, ui.help = new Help, ui.credit = new Credit, ui.landscape = new LandscapeMode, body.append(ui.landscape), ui.current.name.focus(), ui.current.server.childNodes.forEach(function(e) {
            ping(e)
        })
    },
    join: function() {
        ui.ads.time < Date.now() - 5e3 ? ui.sendJoin() : (body.remove(ui.current), ui.ads.init(), body.append(ui.ads), ui.ads.setTime())
    },
    sendJoin: function() {
        ui.join != ui.sendJoin && send(Event.JOIN, {
            name: localStorage.getItem("name"),
            team: ui.team,
            job: ui.job,
            fashion: ui.bag.getCostume()
        })
    },
    respawn: function() {
        body.append(ui.ads)
    },
    replay: function() {
        body.remove(ui.stat), body.remove(ui.score), body.remove(ui.quest), body.contains(ui.text) && (body.remove(ui.text), body.remove(ui.text.bubble)), daynight && daynight.hide(), map.teamBalance(), body.append(ui.current), isDesktop || (button.move.style.display = "none", button.attack.style.display = "none", button.moveStick.style.display = "none", button.attackStick.style.display = "none"), resizeUI(), game.camera.target = null, player.destroy(), window.player = null
    }
};
Radar = function(e, a, t) {
    radarUpdate(e, a, 6, function(e, a, o, s) {
        radar.beginFill("0x" + t.substring(1)), radar.drawCircle(e + 1 - s, a - s, o), radar.endFill()
    })
}, Score = function() {
    return createDOM('<div class="score"></div>')
}, Rank = function() {
    last.score = localStorage.getItem("score") || 0;
    var e = createDOM('<div class="rank">    <div *="rank" class="rank-board">Leaderboard</div>    <div *="bag" class="rank-bag" title="Costume Bag"></div>    </div>');
    return e.rank.onclick = function() {
        body.append(ui.leaderboard);
        try {
            new Ajax({
                url: "http://blockerapi.herokuapp.com/scores",
                method: "POST",
                callback: function(e) {
                    ui.leaderboard.table.innerHTML = '<div class="rank-score">Your Hiscore : <b>' + last.score + "</b></div>";
                    for (var a = JSON.parse(e), t = 0, o = 1; t < a.length; t += 2) ui.leaderboard.table.innerHTML += '<tr><td><span style="opacity:0.5">#</span>' + o + "</td><td>" + a[t] + "</td><td>" + a[t + 1] + "</td></tr>", o++
                }
            })
        } catch (e) {}
    }, e.bag.onclick = function() {
        ui.bag.update(), body.append(ui.bag)
    }, e.setScore = function(e) {
        e > last.score && (localStorage.setItem("score", e), last.score = e)
    }, e.incrPlays = function() {
        var e = localStorage.getItem("plays") || 0;
        e++, localStorage.setItem("plays", e)
    }, e
}, Leaderboard = function() {
    var e = new Credit;
    return e.className = "help leaderboard", e.body.innerHTML = "", e.close.onclick = function() {
        e.parentNode.remove(e)
    }, e.content = createDOM('<div class="help-content"></div>'), e.head = createDOM('<h1 class="rank-title"><img src="' + Server.path + 'assets/ui/crown.svg"> World Ranking</h1>'), e.table = createDOM('<table class="rank-table"></table>'), e.content.append(e.head), e.content.append(e.table), e.body.append(e.content), e
}, Spectator = function() {
    var e = createDOM('<div class="help spectate"><button *="close" class="help-close"></button><div *="body" class="help-body spectate"></div></div>');
    return e.close.onclick = function() {
        var a = game.camera.spectatee;
        radar.clear(), radar.visible = !1, delete a.radar, delete game.camera.spectatee, delete radar.target, body.remove(e), ui.current.style.display = "block", body.remove(ui.stat), body.remove(ui.score), daynight && daynight.hide()
    }, e.body.onclick = function() {
        for (var e = null; !e || !e.hp;) e = randomJSON(creatures);
        e.radar = radar, e.radar.visible = !0, radar.target = e, game.camera.spectatee = e
    }, e.spectate = function() {
        body.append(e), ui.current.style.display = "none", body.append(ui.stat), body.append(ui.score), daynight && daynight.show()
    }, e
}, Daynight = function() {
    var e = game.add.tileSprite(game.width / 2 - 100, 22, 200, 20, "daynight");
    return e.maskSprite = game.add.sprite(game.width / 2 - 100, 17, "daynight.mask"), e.fixedToCamera = !0, e.visible = !1, e.maskSprite.fixedToCamera = !0, e.maskSprite.visible = !1, e.show = function() {
        e.visible = !0, e.maskSprite.visible = !0
    }, e.hide = function() {
        e.visible = !1, e.maskSprite.visible = !1
    }, e
}, Game.quests = {
    nightmares: "Stay in the light",
    speed: "Find 3 blue crystals",
    eater: "Find 3 green crystals",
    reflect: "Find 3 yellow crystals",
    wolf: "Hunt 9 wolves",
    princess: "Protect the lost princess",
    ostrich: "Ride a windy ostrich",
    dragon: "Slay the Dragon",
    defend: "Defend your outpost",
    outpost: "Capture an outpost",
    flag: "Find your team flag"
}, Quest = function() {
    var e = createDOM('<div class="quests"></div>');
    for (var a in Game.quests) e[a] = createDOM('<div class="quest">' + Game.quests[a] + "</div>"), isDesktop && (e[a].style.fontSize = "14px"), e.append(e[a]);
    return e
}, Game.boards = {
    wolf: {
        desc: "Hunt 8 wild wolves",
        reward: "Get Wolf Hat",
        image: "assets/quests/wolf.png"
    },
    speed: {
        desc: "Find 3 blue crystals",
        reward: "Atk speed x2 for 35 secs",
        image: "assets/quests/crystal.blue.png"
    },
    eater: {
        desc: "Find 3 green crystals",
        reward: "Life stealing for 35 secs",
        image: "assets/quests/crystal.green.png"
    },
    reflect: {
        desc: "Find 3 yellow crystals",
        reward: "Undamaged for 30 secs",
        image: "assets/quests/crystal.yellow.png"
    },
    princess: {
        desc: "Protect the Lost Princess",
        reward: "Get Healing",
        image: "assets/quests/princess.png"
    },
    ostrich: {
        desc: "Ride a Windy Ostrich",
        reward: "Move backward faster",
        image: "assets/quests/ostrich.png"
    },
    dragon: {
        desc: "Slay<br>the Dragon",
        reward: "Get Giant Core",
        image: "assets/quests/dragon.png"
    }
}, BoardQuest = function(e, a) {
    var t = createDOM('<div class="board">    <input *="input" type="checkbox" id="board-' + a + '" ' + (e.default ? "checked" : "") + '>    <label for="board-' + a + '">    <img src="' + Server.path + e.image + '"><p>' + e.desc + "</p><div>" + e.reward + "</div>    </label>    </div>");
    return t.input.onchange = function() {
        ui.board.update()
    }, t.key = a, t
}, Board = function() {
    function e() {
        last.questOn = !1, player.questing = !1, body.remove(ui.board), new Sound("close")
    }
    var a = createDOM('<div class="shop">    <div *="bg" class="bg"></div>    <div *="box" class="shop-bg"><div *="container" class="board-container"></div></div>    <button *="close" class="close"></button>    </div>');
    return a.bg.onclick = e, a.close.onclick = e, a.quested = [], a.init = function() {
        for (var e in Game.boards) a.container.append(new BoardQuest(Game.boards[e], e))
    }, a.init(), a.update = function() {
        for (var e in a.container.childNodes) {
            var t = a.container.childNodes[e].key;
            t && (a.container.childNodes[e].input.checked ? ui.quest[t].style.display = "block" : ui.quest[t].style.display = "none")
        }
    }, a
}, Game.costumes = {
    none: {
        desc: "None",
        reward: "No Equipment",
        image: "assets/fashion/none.png",
        score: 0,
        plays: 0
    },
    bunny: {
        desc: "Bunny",
        reward: "10 Plays",
        image: "assets/fashion/bunny.png",
        score: 0,
        plays: 10
    },
    piggy: {
        desc: "Piggy",
        reward: "20 Plays",
        image: "assets/fashion/piggy.png",
        score: 0,
        plays: 20
    },
    froggy: {
        desc: "Froggy",
        reward: "20 Plays",
        image: "assets/fashion/froggy.png",
        score: 0,
        plays: 20
    },
    skull: {
        desc: "Skull",
        reward: "30 Plays",
        image: "assets/fashion/skull.png",
        score: 0,
        plays: 30
    },
    batman: {
        desc: "Batman",
        reward: "30 Plays",
        image: "assets/fashion/batman.png",
        score: 0,
        plays: 30
    },
    nyancat: {
        desc: "Nyan Cat",
        reward: "100 Plays",
        image: "assets/fashion/nyancat.png",
        score: 0,
        plays: 100
    },
    dragonic: {
        desc: "Dragonic",
        reward: "40 Hiscore",
        image: "assets/fashion/dragonic.png",
        score: 40,
        plays: 0
    }
}, CostumeItem = function(e, a) {
    var t = createDOM('<div class="board costume">    <input *="input" type="radio" name="costume" id="costume-' + a + '" value="' + a + '">    <label *="label" for="costume-' + a + '">    <img src="' + Server.path + e.image + '"><p>' + e.desc + "</p><div>" + e.reward + "</div>    </label>    </div>");
    return t.input.onchange = function() {
        ui.bag.getCostume(), ui.bag.update()
    }, t.score = e.score, t.plays = e.plays, t
}, CostumeBag = function() {
    function e() {
        body.remove(ui.bag)
    }
    var a = createDOM('<form class="shop">    <div *="bg" class="bg"></div>    <div *="box" class="shop-bg"><div *="container" class="board-container"></div></div>    <button *="close" class="close"></button>    </form>');
    return a.style.zIndex = 10005, a.bg.style.background = "rgba(184,137,67,0.8)", a.bg.onclick = e, a.close.onclick = e, a.init = function() {
        for (var e in Game.costumes) a.container.append(new CostumeItem(Game.costumes[e], e))
    }, a.update = function() {
        var e = localStorage.getItem("score") || 0,
            t = localStorage.getItem("plays") || 0,
            o = localStorage.getItem("costume") || "none";
        for (var s in a.container.childNodes) {
            var n = a.container.childNodes[s];
            n.input && (n.score <= e && n.plays <= t ? (n.input.removeAttribute("disabled"), n.label.style.background = "#fff", n.style.filter = "grayscale(0)", n.input.value == o && (n.input.setAttribute("checked", ""), n.label.style.background = "#57BBF0")) : (n.input.setAttribute("disabled", ""), n.label.style.background = "#ddd", n.style.filter = "grayscale(0.5)"))
        }
    }, a.init(), a.update(), a.getCostume = function() {
        var e = a.elements.costume.value;
        return localStorage.setItem("costume", e), e
    }, a
}, Game.season = "spring", Game.seasons = {
    spring: {
        update: function() {
            tweenColor(function(e) {
                game.stage.backgroundColor = "#" + e
            }, Game.seasons.autumn.color, Game.seasons.spring.color, 5e3)
        },
        color: 4960316
    },
    winter: {
        update: function() {
            tweenColor(function(e) {
                game.stage.backgroundColor = "#" + e
            }, Game.seasons.spring.color, Game.seasons.winter.color, 5e3)
        },
        color: 5617805
    },
    autumn: {
        update: function() {
            tweenColor(function(e) {
                game.stage.backgroundColor = "#" + e
            }, Game.seasons.winter.color, Game.seasons.autumn.color, 5e3)
        },
        color: 12889955
    }
}, ui.ads = new Ads;
var promo = createDOM('<div class="promo"   style="position:fixed;width:100%;height:100%;background:#000 url(promo.svg) no-repeat center;background-size:contain;z-index:99999"></div>');
promo.onclick = function() {
    body.remove(promo)
}, body.append(promo), startRender();