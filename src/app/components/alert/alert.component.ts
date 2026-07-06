import { CommonModule } from '@angular/common'
import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    inject,
} from '@angular/core'
import { AlertTypeEnum } from '@enums'
import { Alert } from '@models'
import { AlertService } from '@services'
import { Subscription } from 'rxjs'

@Component({
    selector: 'app-alert',
    imports: [CommonModule],
    templateUrl: './alert.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './alert.component.css',
})
export class AlertComponent implements OnDestroy {
    private readonly alertSvc = inject(AlertService)

    alerts: Alert[] = []
    subscription: Subscription

    constructor() {
        this.subscription = this.alertSvc
            .getAlerts()
            .subscribe((n) => (this.alerts = n))
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe()
    }

    removeAlert = (id: string): void => {
        this.alertSvc.removeAlert(id)
    }

    getAlertClass = (type: AlertTypeEnum): string => {
        switch (type) {
            case AlertTypeEnum.Success:
                return 'alert-success'
            case AlertTypeEnum.Info:
                return 'alert-info'
            case AlertTypeEnum.Error:
                return 'alert-danger'
        }
    }
}
