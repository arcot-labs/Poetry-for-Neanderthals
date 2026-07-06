import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    inject,
    Output,
} from '@angular/core'
import { GameService } from '@services'

@Component({
    selector: 'app-game-summary',
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './game-summary.component.html',
})
export class GameSummaryComponent {
    @Output() endGame = new EventEmitter<void>()

    private readonly gameSvc = inject(GameService)

    get gameState() {
        const state = this.gameSvc.gameState
        if (!state) throw Error('failed to get game state')
        return state
    }

    get scores(): number[] {
        return this.gameState.gameplay.scores
    }

    get teams(): number {
        return this.gameState.settings.teams
    }

    get winners(): number[] {
        const maxScore = Math.max(...this.scores)
        return this.scores
            .map((score, idx) => (score === maxScore ? idx : ''))
            .filter(String) as number[]
    }

    get tie(): boolean {
        return this.winners.length > 1
    }
}
