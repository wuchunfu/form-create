import Api from '../frame/api';
import Render from '../render';
import extend from '@form-create/utils/lib/extend';
import {funcProxy, invoke} from '../frame/util';
import useInject from './inject';
import usePage from './page';
import useRender from './render';
import useLoader from './loader';
import useInput from './input';
import useContext from './context';
import useLifecycle from './lifecycle';
import useEffect from './effect';
import is from '@form-create/utils/lib/type';


export default function Handler(fc) {
    extend(this, {
        fc,
        vm: fc.vm,
        watching: false,
        loading: false,
        reloading: false,
        noWatchFn: null,
        deferSyncFn: null,
        isMounted: false,
        formData: {},
        subForm: {},
        form: {},
        appendData: {},
        providers: {},
        cycleLoad: null,
        loadedId: 1,
        nextTick: null,
        changeStatus: false,
        pageEnd: true,
        nextReload: () => {
            this.lifecycle('reload');
        }
    });

    funcProxy(this, {
        options() {
            return fc.options;
        },
        bus() {
            return fc.bus;
        },
    })

    this.initData(fc.rules);

    this.$manager = new fc.manager(this);
    this.$render = new Render(this);
    this.api = fc.extendApi(Api(this), this);
}

extend(Handler.prototype, {
    initData(rules) {
        extend(this, {
            ctxs: {},
            fieldCtx: {},
            nameCtx: {},
            sort: [],
            rules,
        });
    },
    init() {
        this.appendData = {...this.fc.options.formData || {}, ...this.vm.value || {}, ...this.appendData};
        this.useProvider();
        this.usePage();
        this.loadRule();
        this.$manager.__init();
        this.lifecycle('created');
        this.vm.$set(this.vm, 'formData', this.formData);
    },
    beforeFetch(opt) {
        return new Promise((resolve) => {
            const source = this.options.beforeFetch && invoke(() => this.options.beforeFetch(opt, {api: this.api}));
            if (source && is.Function(source.then)) {
                source.then(resolve);
            } else {
                resolve();
            }
        });
    },
})

useInject(Handler);
usePage(Handler);
useRender(Handler);
useLoader(Handler);
useInput(Handler);
useContext(Handler);
useLifecycle(Handler);
useEffect(Handler);
