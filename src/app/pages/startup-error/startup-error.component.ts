import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    inject,
} from '@angular/core'
import { Router } from '@angular/router'
import { StartupService } from '@services'

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './startup-error.component.html',
})
export class StartupErrorComponent implements OnInit {
    private readonly startupSvc = inject(StartupService)
    private readonly router = inject(Router)

    ngOnInit(): void {
        if (this.startupSvc.success) void this.router.navigateByUrl('/')
    }
}
