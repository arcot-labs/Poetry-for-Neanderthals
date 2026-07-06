import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    inject,
    OnInit,
    Output,
} from '@angular/core'
import { GamePointsEnum } from '@enums'
import { Card, gamePointsCategoryMap } from '@models'
import { AlertService, GameService } from '@services'
// eslint-disable-next-line no-restricted-imports
import { LoggerComponent } from '../logger.component'

@Component({
    selector: 'app-game-turn-summary',
    templateUrl: './game-turn-summary.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './game-turn-summary.component.css',
})
export class GameTurnSummaryComponent
    extends LoggerComponent
    implements OnInit
{
    @Output() nextTurn = new EventEmitter<void>()

    private readonly alertSvc = inject(AlertService)
    private readonly gameSvc = inject(GameService)

    readonly gamePointsEnum = GamePointsEnum

    constructor() {
        super('GameTurnSummaryComponent')
    }

    ngOnInit(): void {
        if (this.points.length !== this.cards.length - 1)
            throw Error('turn points and cards mismatch')
    }

    get gameState() {
        const state = this.gameSvc.gameState
        if (!state) throw Error('failed to get game state')
        return state
    }

    get team(): number {
        return this.gameState.gameplay.team
    }

    get teams(): number {
        return this.gameState.settings.teams
    }

    get scores(): number[] {
        return this.gameState.gameplay.scores
    }

    get isEditing(): boolean {
        return this.gameState.gameplay.turn.isEditing
    }

    get points(): number[] {
        return this.gameState.gameplay.turn.points
    }

    get cards(): Card[] {
        return this.gameState.gameplay.turn.cards
    }

    editTurn = () => {
        this.gameSvc.updateGameState({
            gameplay: {
                turn: {
                    isEditing: true,
                },
            },
        })
        this.alertSvc.addInfoAlert(
            this.logger,
            'Editing turn',
            'Select the 1-point word, 3-point phrase, or skip for each card',
            'The last card is used to end the turn and cannot be edited'
        )
    }

    saveTurn = () => {
        this.gameSvc.updateGameState({
            gameplay: {
                turn: {
                    isEditing: false,
                },
            },
        })
        this.alertSvc.addSuccessAlert(this.logger, 'Saved turn')
    }

    editCardPoints = (gamePointsEnum: GamePointsEnum, cardIdx: number) => {
        this.points[cardIdx] = gamePointsEnum
        this.gameSvc.updateGameState({
            gameplay: {
                turn: {
                    points: this.points,
                },
            },
        })
    }

    continue = () => {
        if (this.isEditing) {
            this.alertSvc.addErrorAlert(
                this.logger,
                'Cannot continue while editing turn',
                'Please save your edits before continuing'
            )
            return
        }
        this.nextTurn.emit()
    }

    get totalTurnPoints(): number {
        return this.points.reduce((acc, points) => acc + points, 0)
    }

    getCardOnePointClass = (cardIdx: number): string => {
        return this.getCardCategoryClass(cardIdx, GamePointsEnum.One)
    }

    getCardThreePointClass = (cardIdx: number): string => {
        return this.getCardCategoryClass(cardIdx, GamePointsEnum.Three)
    }

    getCardSkipClass = (cardIdx: number): string => {
        return this.getCardCategoryClass(cardIdx, GamePointsEnum.Skip)
    }

    getTeamScore = (team: number): number => {
        if (team === this.team) {
            return this.scores[team] + this.totalTurnPoints
        }
        return this.scores[team]
    }

    private getCardCategoryClass = (
        cardIdx: number,
        pointsEnum: GamePointsEnum
    ): string => {
        const classes = ['btn', 'btn-link']
        if (this.isEditing) classes.push('editing')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        if (cardIdx < this.points.length && this.points[cardIdx] === pointsEnum)
            classes.push(...this.getSelectedClasses(pointsEnum))
        else classes.push('text-body-tertiary')
        return classes.join(' ')
    }

    private getSelectedClasses = (pointsEnum: GamePointsEnum): string[] => {
        const category = gamePointsCategoryMap[pointsEnum]
        return [`text-${category}`, 'fw-bold']
    }
}
