
import { Bee, Gold, Goblin, Wolf, Slime, Monsters } from './mosters.js';
import { Tower, CampFire } from './buildings.js';

var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'gameContainer', // 게임을 포함할 HTML 요소의 ID
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    // width: 1280,
    // height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var game = new Phaser.Game(config);
function preload (){
    this.load.image('map', './mapImages/mainMap.jpg');// 맵
    this.load.spritesheet('campFire', './mapImages/campFire.png', // 캠프파이어
    { frameWidth: 32, frameHeight: 32 });
    //몬스터 이미지
    this.load.spritesheet('beeD', './mapImages/beeDWalk.png',  // 벌
    { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('goblinU', './mapImages/goblinUWalk.png',  
    { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('wolfS', './mapImages/wolfSWalk.png',  
    {frameWidth:48, frameHeight:48})
    this.load.spritesheet('slimeSWalk', './mapImages/slimeSWalk.png',  
    {frameWidth:48, frameHeight:48})

    this.load.spritesheet('tower1', './mapImages/tower1.png',  // 타워
    {frameWidth:70, frameHeight:130})
    this.load.image('arrowUp', './mapImages/arrowUp.png' ) //화살
    this.load.image('towerUp', './mapImages/towerUp.png')
    this.load.image('newTower', './mapImages/newTower.png')
    this.load.image('speedUp', './mapImages/speedUp.png')
}

function create (){
    var self = this
    //map이미지 넣기
    let map = this.add.image(640, 360, 'map')
    map.setScale(1)
    //camp fire 생성
    let campFire = new CampFire(this, 622, 335, 'campFire')
    //gold텍스트
    this.golds = 0
    this.goldText = this.add.text(10, 10, 'Gold: 0', { fontSize: '24px', fill: '#fff' });
    let gold = new Gold(this)
    //게임시간
    this.gameTimeText = this.add.text(200, 10, 'Time: 0', 
    { fontSize: '24px', fill: '#fff' });
    //공격 몬스터 카운트
    this.monsterCount = 0
    this.monsterCountText = this.add.text(400, 10, 'Attacked :' + this.monsterCount, 
    { fontSize: '24px', fill: '#fff' });

    //게임설명
    this.newTowerText = this.add.text(700, 10, '몬스터 50 이상이면 게임 오버', 
    { fontSize: '30px', fill: '#fff' });
    this.newTowerText = this.add.text(700, 40, '새 건물 짓기 : 뉴 타워 클릭 후 드래그', 
    { fontSize: '30px', fill: '#fff' });
    this.isSpeedUpText =  null

    //개발자
    this.myName = this.add.text(10, 670, 'From : YejongHan', 
    { fontSize: '30px', fill: '#fff' });
    //설정 변수들
    this.isBuildingTower = false
    let isTowerUp = false
    this.towerPreview ;
    this.isOkayBuild =false
    this.startTime = this.time.now;

    //버튼 기능
    let buttonTowerUp = this.add.image(950, 660, 'towerUp').setInteractive();
    let buttonNewTower = this.add.image(1075, 660, 'newTower').setInteractive();
    let buttonSpeedUp = this.add.image(1200, 660, 'speedUp').setInteractive();

    //베이스 캠프 위치 지정(몹들이 올곳)
    this.baseCamp = {x: 640, y:360}

    //화살, 몬스터(벌) 생성
    this.arrows = this.physics.add.group();
    this.monGroup = this.physics.add.group();

    //타워 생성
    this.towers = []
    this.tower1 = new Tower(this, 690, 260, 'tower1')
    this.tower2 = new Tower(this, 500, 200, 'tower1')
    this.towers.push(this.tower1)
    this.towers.push(this.tower2)
    var towerVar = this.towers

    //아이템 가격
    var buildingMoney = 500
    var speedUpMoney = 700
    this.newTowerText = this.add.text(1040, 600, '$'+buildingMoney, { fontSize: '22px', fill: '#fff' });
    this.speedUpText = this.add.text(1140, 600, '$'+speedUpMoney, { fontSize: '22px', fill: '#fff' });

    buttonTowerUp.on('pointerdown', function () {
        console.log('버튼이 클릭되었습니다!');
        // 버튼 클릭 시 실행할 로직
    });
    buttonNewTower.on('pointerdown', function () {
        if(this.scene.golds >= buildingMoney){
            self.isBuildingTower = true
            if (self.towerPreview == null) {
                let pointer = self.input.activePointer;
                self.towerPreview = self.add.image(pointer.x, pointer.y-16, 'tower1');
                self.towerPreview.setAlpha(1);
            }
        }
    });
    buttonSpeedUp.on('pointerdown',function () {
        if(this.scene.golds >= speedUpMoney){
            isTowerUp = true
            towerVar.forEach(tower =>{
                tower.fireRate *= 0.85
            })
        }
    });

    // 몬스터와 화살의 충돌 처리
    this.physics.add.collider(this.arrows, this.monGroup, function(arrow, bee) {
        arrow.destroy(); // 화살 제거
        bee.takeDamage(gold, 25); // 몬스터의 takeDamage 메서드 호출
        gold.countingMonster()
    });

    this.input.on('pointermove', (pointer) => {
        if (this.isBuildingTower) {
            if (!this.towerPreview) {
                this.towerPreview = this.add.image(pointer.x, pointer.y-16, 'tower1');
            }else{
                this.towerPreview.x = pointer.x;
                this.towerPreview.y = pointer.y-16;
            }
        }
    });

    this.input.on('pointerup', (pointer) => {
        if (this.isBuildingTower & this.isOkayBuild) {
            let tower = new Tower(this, pointer.x, pointer.y-16, 'tower1')
            this.towers.push(tower);
            towerVar = this.towers
            this.isBuildingTower = false

            this.golds -= buildingMoney
            this.goldText.setText('Gold: ' +this.scene.golds);
            this.towerPreview.destroy();
            this.towerPreview = null
            buildingMoney = Math.ceil(buildingMoney*1.4)
            this.newTowerText.setText('$'+buildingMoney)
        }
        else if(isTowerUp){
            this.golds -= speedUpMoney
            this.goldText.setText('Gold: ' +this.scene.golds);
            speedUpMoney = Math.ceil(speedUpMoney*1.7)
            this.speedUpText.setText('$'+speedUpMoney)
            this.isSpeedUpText = this.add.text(500, 350, '타워 공속 업!', 
            { fontSize: '22px', fill: '#000' });
            setTimeout(()=>{
                this.isSpeedUpText.setText('')
            },2000)
            isTowerUp = false
        }

    });

    for (let i = 0; i < 5; i++) {
        setTimeout(()=>{
            let bee = new Bee(this, Phaser.Math.Between(580, 690), 
            Phaser.Math.Between(50, 60), 'beeD');
            this.monGroup.add(bee);
            bee = null
        },i*2000)
    }

    let monsterZenWolf = 2
    let monsterZenGoblin = 3
    let monsterZenBee = 5
    let monsterZenSlime = 5
    this.time.addEvent({ delay: 31000, 
        callback: ()=> {
            monsterZenBee += 2
            monsterZenWolf += 2
            monsterZenGoblin +=2
        }, 
        callbackScope: this, loop: true });
    

    // 타이머 이벤트 설정, 벌 등장
    this.time.addEvent({ 
        delay: 10, 
        callback: () => {
            this.time.addEvent({
                delay: 10000,
                callback: () => createBeeD.call(this, monsterZenBee),
                callbackScope: this,
                loop: true
            });
        },
        callbackScope: this, 
        loop: false });
    // 고블린 등장
    this.time.addEvent({ 
        delay: 10000, 
        callback: () => {
            this.time.addEvent({
                delay: 20000,
                callback: () => createGoblinU.call(this, monsterZenGoblin),
                callbackScope: this,
                loop: true
            });
        },
        callbackScope: this, 
        loop: false });
    // 늑대 등장
    this.time.addEvent({ 
        delay: 30000, 
        callback: () => {
            this.time.addEvent({
                delay: 30000,
                callback: () => createWolfS.call(this, monsterZenWolf),
                callbackScope: this,
                loop: true
            });
        },
        callbackScope: this, 
        loop: false });
    //슬라임 등장
    this.time.addEvent({ 
        delay: 60000, 
        callback: () => {
            this.time.addEvent({
                delay: 60000,
                callback: () => {createSlimeS.call(this, monsterZenSlime)
                    monsterZenSlime += 5},
                callbackScope: this,
                loop: true
            });
        },
        callbackScope: this, 
        loop: false });


}


function update (time){
    this.gameTimeText.setText('Time : ' + Math.ceil((time)/1000))
    this.monGroup.getChildren().forEach((beeD) =>{
        this.physics.moveToObject(beeD, this.baseCamp, beeD.speed);
        //몬스터(벌) 타워에서 감지
        this.towers.forEach(tower => {
            if (Phaser.Geom.Circle.ContainsPoint(tower.attackRange, beeD)) {
                // 현재 시간이 마지막 발사 시간 + 발사 간격보다 클 경우 화살 발사
                if (time > tower.LastFired + tower.fireRate) {
                    fireArrow.call(this, tower.x, tower.y, beeD.x, beeD.y);
                    tower.LastFired = time; // 마지막 발사 시간 업데이트
                }
            }
        });
    })
    if(this.monsterCount > 50){
        this.scene.restart()
    }
    let pointer = this.input.activePointer;
    // 조건을 만족하는 타워가 있는지 확인
    let isCloseToTower = this.towers.some(tower => {
        return Phaser.Math.Distance.Between(pointer.x, pointer.y, tower.x, tower.y+10) < 64;
    });
    if (this.towerPreview != null) {
        if (isCloseToTower) {
            this.towerPreview.setAlpha(0.5);
            this.isOkayBuild = !isCloseToTower
        } else {
            this.towerPreview.setAlpha(1);
            this.isOkayBuild = !isCloseToTower
        }
    }
        
    
}

function fireArrow(x,y,targetX, targetY){
    let arrow = this.arrows.create(x, y, 'arrowUp');
    this.physics.moveToObject(arrow, { x: targetX, y: targetY }, 170);
}

function createBeeD(number){
    for (let i = 0; i < number; i++) {
        setTimeout(()=>{
            let bee = new Bee(this, Phaser.Math.Between(580, 690), 
            Phaser.Math.Between(50, 60), 'beeD');
            this.monGroup.add(bee);
            bee = null
        },i*2000)
    }
}
function createGoblinU(number){
    for (let i = 0; i < number; i++) {
        setTimeout(()=>{
            let goblin = new Goblin(this, Phaser.Math.Between(600, 710), 
            Phaser.Math.Between(670, 680), 'goblinU');
            this.monGroup.add(goblin);
            goblin = null
        },i*2000)
    }
}
function createWolfS(number){
    for (let i = 0; i < number; i++) {
        setTimeout(()=>{
            let wolf = new Wolf(this, Phaser.Math.Between(1150, 1200), 
            Phaser.Math.Between(350, 400), 'wolfSWalk');
            this.monGroup.add(wolf);
            wolf = null
        },i*500)
    }
}

function createSlimeS(number){
    for (let i = 0; i < number; i++) {
        setTimeout(()=>{
            let slime = new Slime(this, Phaser.Math.Between(10, 20), 
            Phaser.Math.Between(450, 500), 'slimeSWalk');
            this.monGroup.add(slime);
            slime = null
        },i*500)
    }
}

function canPlaceTower(x, y) {
    let canPlace = true;
    let towerWidth = 48
    this.towers.forEach(tower => {
        if (Phaser.Math.Distance.Between(x, y, tower.x, tower.y) < towerWidth) {
            canPlace = false;
        }
    });
    return canPlace;
}
