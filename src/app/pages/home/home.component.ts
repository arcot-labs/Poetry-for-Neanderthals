import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    OnInit,
    ViewChild,
} from '@angular/core'
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
} from '@angular/forms'
import { Router } from '@angular/router'
import { LoggerComponent } from '@components'
import { RouteEnum } from '@enums'
import { GameService, RandomService } from '@services'
import { Modal } from 'bootstrap'

@Component({
    imports: [ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './home.component.html',
})
export class HomeComponent
    extends LoggerComponent
    implements OnInit, AfterViewInit
{
    private readonly formBuilder = inject(FormBuilder)
    private readonly gameSvc = inject(GameService)
    private readonly randomSvc = inject(RandomService)
    private readonly router = inject(Router)

    private modalInstance!: Modal

    @ViewChild('newGameForm') newGameForm!: ElementRef<HTMLFormElement>
    newGameFormGroup: FormGroup

    savedGame = false
    selectGameScreen = true
    continueGameScreen = false

    constructor() {
        super('HomeComponent')
        this.newGameFormGroup = this.formBuilder.group(
            {
                turnTime: [60],
                rounds: [3],
                playersPerTeam: [3],
                useCustomSeed: [false],
                customSeed: [null],
            },
            { validators: this.validateCustomSeed }
        )
    }

    get gameState() {
        return this.gameSvc.gameState
    }

    ngOnInit(): void {
        if (this.gameState) {
            this.logger.debug('found existing game state')
            this.savedGame = true
        }
    }

    ngAfterViewInit(): void {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const modalElement = document.getElementById('overrideGameModal')!
        this.modalInstance = new Modal(modalElement)
    }

    tryContinueGame = () => {
        this.logger.info('trying to continue game')
        this.selectGameScreen = false
        this.continueGameScreen = true
    }

    continueGame = () => {
        this.logger.info('continuing game')
        void this.router.navigateByUrl(RouteEnum.Game)
    }

    tryStartNewGame = () => {
        this.logger.info('trying to start new game')
        if (!this.savedGame) {
            this.startNewGame()
            return
        }
        this.modalInstance.show()
    }

    startNewGame = () => {
        this.logger.info('starting new game')
        this.selectGameScreen = false
        this.continueGameScreen = false
    }

    handleNewGameFormKeypress = (event: KeyboardEvent) => {
        if (event.key === 'Enter') this.validateNewGameForm()
    }

    validateNewGameForm = () => {
        const newGameForm = this.newGameForm.nativeElement
        if (!this.newGameFormGroup.valid) this.logger.debug('validation failed')
        else this.startGame()
        newGameForm.classList.add('was-validated')
    }

    validateCustomSeed = (control: AbstractControl) => {
        const useCustomSeed: boolean = control.get('useCustomSeed')
            ?.value as boolean
        if (!useCustomSeed) return null

        const customSeed: number | null = control.get('customSeed')?.value as
            number | null
        if (customSeed === null) return { customSeedRequired: true }
        if (customSeed < 0 || customSeed > 999999)
            return { customSeedOutOfRange: true }
        return null
    }

    setCustomSeedValidity = (input: HTMLInputElement) => {
        if (this.newGameFormGroup.errors) {
            const messages = Object.keys(this.newGameFormGroup.errors)
            input.setCustomValidity(messages.join(', '))
        } else {
            input.setCustomValidity('')
        }
    }

    private startGame = () => {
        /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
        this.logger.debug('starting game', { ...this.newGameFormGroup.value })
        const seed = String(
            this.newGameFormGroup.value.customSeed ?? Date.now() % 1000000
        )
        this.randomSvc.seed = seed
        this.gameSvc.createGameState(
            this.newGameFormGroup.value.turnTime,
            this.newGameFormGroup.value.rounds,
            2, // teams
            this.newGameFormGroup.value.playersPerTeam,
            seed
        )
        void this.router.navigateByUrl(RouteEnum.Game)
        /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
    }
}
