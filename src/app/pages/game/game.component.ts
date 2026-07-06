import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    ViewChild,
} from '@angular/core'
import { Router } from '@angular/router'
import {
    GameSummaryComponent,
    GameTurnComponent,
    GameTurnSummaryComponent,
    LoggerComponent,
} from '@components'
import { RouteEnum } from '@enums'
import { isInTurn } from '@models'
import { GameService } from '@services'
import { Modal } from 'bootstrap'

@Component({
    imports: [
        GameTurnComponent,
        GameTurnSummaryComponent,
        GameSummaryComponent,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './game.component.html',
})
export class GameComponent
    extends LoggerComponent
    implements OnInit, AfterViewInit
{
    private readonly gameSvc = inject(GameService)
    private readonly router = inject(Router)

    private modalInstance!: Modal
    private viewInit = false

    @ViewChild(GameTurnComponent) gameTurnComponent!: GameTurnComponent

    constructor() {
        super('GameComponent')
    }

    ngOnInit(): void {
        if (!this.gameSvc.gameState) {
            void this.router.navigateByUrl(RouteEnum.Home)
            return
        }
    }

    ngAfterViewInit(): void {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const modalElement = document.getElementById('returnHomeModal')!
        this.modalInstance = new Modal(modalElement)
        this.viewInit = true
    }

    get gameState() {
        const state = this.gameSvc.gameState
        if (!state) throw Error('failed to get game state')
        return state
    }

    get isInTurn(): boolean {
        return isInTurn(this.gameState)
    }

    get paused(): boolean {
        if (!this.viewInit) return true
        return this.gameTurnComponent.resumeScreen
    }

    tryReturnHome = () => {
        this.logger.info('trying to return home')
        if (!this.isInTurn || this.paused) {
            this.returnHome()
            return
        }
        this.pauseGame()
        this.modalInstance.show()
    }

    returnHome = () => {
        this.logger.info('returning home')
        void this.router.navigateByUrl(RouteEnum.Home)
    }

    pauseGame = () => {
        this.logger.info('pausing game')
        this.gameTurnComponent.pauseTurn()
    }

    resumeGame = () => {
        this.logger.info('resuming game')
        this.gameTurnComponent.resumeTurn()
    }

    handleTurnDone = (): void => {
        this.gameSvc.updateGameState({
            gameplay: {
                turn: {
                    isDone: true,
                    isEditing: false,
                    timeRemaining: 0,
                },
            },
        })
    }

    handleNextTurn = (): void => {
        const scores = this.gameState.gameplay.scores
        const turnPoints = this.gameState.gameplay.turn.points
        scores[this.gameState.gameplay.team] += turnPoints.reduce(
            (a, b) => a + b,
            0
        )

        const teams = this.gameState.settings.teams
        const playersPerTeam = this.gameState.settings.playersPerTeam

        let round = this.gameState.gameplay.round
        let team = this.gameState.gameplay.team
        let player = this.gameState.gameplay.player
        let gameOver = this.gameState.gameplay.gameOver

        if (team !== teams - 1) {
            team++
        } else {
            if (player !== playersPerTeam - 1) {
                player++
                team = 0
            } else {
                if (round !== this.gameState.settings.rounds - 1) {
                    round++
                    player = 0
                    team = 0
                } else {
                    gameOver = true
                }
            }
        }

        this.gameSvc.updateGameState({
            gameplay: {
                round,
                team,
                player,
                scores,
                gameOver,
                turn: {
                    isDone: false,
                    isEditing: false,
                    points: [],
                    cards: [],
                },
            },
        })
    }

    handleEndGame = (): void => {
        this.gameSvc.clearGameState()
        void this.router.navigateByUrl(RouteEnum.Home)
    }
}
