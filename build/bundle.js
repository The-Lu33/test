
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.52.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\lib\Nabvar.svelte generated by Svelte v3.52.0 */

    const file$9 = "src\\lib\\Nabvar.svelte";

    function create_fragment$a(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let nav;
    	let h2;
    	let t1;
    	let div0;
    	let span0;
    	let t2;
    	let span1;
    	let t3;
    	let span2;
    	let t4;
    	let div1;
    	let ul;
    	let li0;
    	let a0;
    	let t6;
    	let hr0;
    	let t7;
    	let li1;
    	let a1;
    	let t9;
    	let hr1;
    	let t10;
    	let li2;
    	let a2;
    	let t12;
    	let hr2;
    	let t13;
    	let li3;
    	let a3;
    	let t15;
    	let hr3;
    	let t16;
    	let li4;
    	let a4;
    	let t18;
    	let hr4;
    	let t19;
    	let li5;
    	let a5;
    	let t21;
    	let hr5;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[3]);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			h2 = element("h2");
    			h2.textContent = "The Lú";
    			t1 = space();
    			div0 = element("div");
    			span0 = element("span");
    			t2 = space();
    			span1 = element("span");
    			t3 = space();
    			span2 = element("span");
    			t4 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "home";
    			t6 = space();
    			hr0 = element("hr");
    			t7 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "About Me";
    			t9 = space();
    			hr1 = element("hr");
    			t10 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Skills";
    			t12 = space();
    			hr2 = element("hr");
    			t13 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Tecnologies";
    			t15 = space();
    			hr3 = element("hr");
    			t16 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Brifcase";
    			t18 = space();
    			hr4 = element("hr");
    			t19 = space();
    			li5 = element("li");
    			a5 = element("a");
    			a5.textContent = "Contac";
    			t21 = space();
    			hr5 = element("hr");
    			attr_dev(h2, "class", "tittle_nabvar svelte-11kr8ck");
    			add_location(h2, file$9, 13, 2, 202);
    			attr_dev(span0, "class", "line1 svelte-11kr8ck");
    			toggle_class(span0, "active_line1", /*active*/ ctx[0]);
    			add_location(span0, file$9, 16, 4, 355);
    			attr_dev(span1, "class", "line2 svelte-11kr8ck");
    			toggle_class(span1, "active_line2", /*active*/ ctx[0]);
    			add_location(span1, file$9, 17, 4, 411);
    			attr_dev(span2, "class", "line3 svelte-11kr8ck");
    			toggle_class(span2, "active_line3", /*active*/ ctx[0]);
    			add_location(span2, file$9, 18, 4, 467);
    			attr_dev(div0, "class", "btn__Nabvar svelte-11kr8ck");
    			add_location(div0, file$9, 15, 2, 303);
    			attr_dev(a0, "href", "#principal_header");
    			attr_dev(a0, "class", "svelte-11kr8ck");
    			add_location(a0, file$9, 23, 8, 630);
    			attr_dev(hr0, "class", "line svelte-11kr8ck");
    			add_location(hr0, file$9, 24, 8, 676);
    			attr_dev(li0, "class", "svelte-11kr8ck");
    			add_location(li0, file$9, 22, 6, 616);
    			attr_dev(a1, "href", "#section_about");
    			attr_dev(a1, "class", "svelte-11kr8ck");
    			add_location(a1, file$9, 27, 8, 730);
    			attr_dev(hr1, "class", "line svelte-11kr8ck");
    			add_location(hr1, file$9, 28, 8, 777);
    			attr_dev(li1, "class", "svelte-11kr8ck");
    			add_location(li1, file$9, 26, 6, 716);
    			attr_dev(a2, "href", "#section_skrills");
    			attr_dev(a2, "class", "svelte-11kr8ck");
    			add_location(a2, file$9, 31, 8, 831);
    			attr_dev(hr2, "class", "line svelte-11kr8ck");
    			add_location(hr2, file$9, 32, 8, 878);
    			attr_dev(li2, "class", "svelte-11kr8ck");
    			add_location(li2, file$9, 30, 6, 817);
    			attr_dev(a3, "href", "#techonologies_container");
    			attr_dev(a3, "class", "svelte-11kr8ck");
    			add_location(a3, file$9, 35, 8, 932);
    			attr_dev(hr3, "class", "line svelte-11kr8ck");
    			add_location(hr3, file$9, 36, 8, 992);
    			attr_dev(li3, "class", "svelte-11kr8ck");
    			add_location(li3, file$9, 34, 6, 918);
    			attr_dev(a4, "href", "#briefcase_container");
    			attr_dev(a4, "class", "svelte-11kr8ck");
    			add_location(a4, file$9, 39, 8, 1046);
    			attr_dev(hr4, "class", "line svelte-11kr8ck");
    			add_location(hr4, file$9, 40, 8, 1099);
    			attr_dev(li4, "class", "svelte-11kr8ck");
    			add_location(li4, file$9, 38, 6, 1032);
    			attr_dev(a5, "href", "#contact");
    			attr_dev(a5, "class", "svelte-11kr8ck");
    			add_location(a5, file$9, 43, 8, 1153);
    			attr_dev(hr5, "class", "line svelte-11kr8ck");
    			add_location(hr5, file$9, 44, 8, 1192);
    			attr_dev(li5, "class", "svelte-11kr8ck");
    			add_location(li5, file$9, 42, 6, 1139);
    			attr_dev(ul, "class", "svelte-11kr8ck");
    			add_location(ul, file$9, 21, 4, 604);
    			attr_dev(div1, "class", "menu_responsive svelte-11kr8ck");
    			toggle_class(div1, "active_menu_responsive", /*active*/ ctx[0]);
    			add_location(div1, file$9, 20, 2, 531);
    			attr_dev(nav, "class", "nav svelte-11kr8ck");
    			toggle_class(nav, "show_nav", /*y*/ ctx[1] >= 60);
    			add_location(nav, file$9, 12, 0, 155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, h2);
    			append_dev(nav, t1);
    			append_dev(nav, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(div0, t3);
    			append_dev(div0, span2);
    			append_dev(nav, t4);
    			append_dev(nav, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(li0, t6);
    			append_dev(li0, hr0);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(li1, t9);
    			append_dev(li1, hr1);
    			append_dev(ul, t10);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(li2, t12);
    			append_dev(li2, hr2);
    			append_dev(ul, t13);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(li3, t15);
    			append_dev(li3, hr3);
    			append_dev(ul, t16);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(li4, t18);
    			append_dev(li4, hr4);
    			append_dev(ul, t19);
    			append_dev(ul, li5);
    			append_dev(li5, a5);
    			append_dev(li5, t21);
    			append_dev(li5, hr5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[3]();
    					}),
    					listen_dev(div0, "click", /*btnNabvar*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y*/ 2 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*y*/ ctx[1]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (dirty & /*active*/ 1) {
    				toggle_class(span0, "active_line1", /*active*/ ctx[0]);
    			}

    			if (dirty & /*active*/ 1) {
    				toggle_class(span1, "active_line2", /*active*/ ctx[0]);
    			}

    			if (dirty & /*active*/ 1) {
    				toggle_class(span2, "active_line3", /*active*/ ctx[0]);
    			}

    			if (dirty & /*active*/ 1) {
    				toggle_class(div1, "active_menu_responsive", /*active*/ ctx[0]);
    			}

    			if (dirty & /*y*/ 2) {
    				toggle_class(nav, "show_nav", /*y*/ ctx[1] >= 60);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nabvar', slots, []);
    	let active = false;

    	let btnNabvar = () => {
    		$$invalidate(0, active = !active);
    	};

    	let y;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nabvar> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(1, y = window.pageYOffset);
    	}

    	$$self.$capture_state = () => ({ active, btnNabvar, y });

    	$$self.$inject_state = $$props => {
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('btnNabvar' in $$props) $$invalidate(2, btnNabvar = $$props.btnNabvar);
    		if ('y' in $$props) $$invalidate(1, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, y, btnNabvar, onwindowscroll];
    }

    class Nabvar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nabvar",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\lib\Header.svelte generated by Svelte v3.52.0 */

    const file$8 = "src\\lib\\Header.svelte";

    function create_fragment$9(ctx) {
    	let section;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let article;
    	let h3;
    	let t3;
    	let h2;
    	let t5;
    	let hr;
    	let t6;
    	let p;
    	let t8;
    	let div1;
    	let button0;
    	let a0;
    	let img2;
    	let img2_src_value;
    	let t9;
    	let button1;
    	let a1;
    	let img3;
    	let img3_src_value;
    	let t10;
    	let button2;
    	let a2;
    	let img4;
    	let img4_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			article = element("article");
    			h3 = element("h3");
    			h3.textContent = "I AM";
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "THE Lú";
    			t5 = space();
    			hr = element("hr");
    			t6 = space();
    			p = element("p");
    			p.textContent = "Full Stack Developer Designer ux/ui";
    			t8 = space();
    			div1 = element("div");
    			button0 = element("button");
    			a0 = element("a");
    			img2 = element("img");
    			t9 = space();
    			button1 = element("button");
    			a1 = element("a");
    			img3 = element("img");
    			t10 = space();
    			button2 = element("button");
    			a2 = element("a");
    			img4 = element("img");
    			attr_dev(img0, "alt", "imagens");
    			if (!src_url_equal(img0.src, img0_src_value = "./image/0.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "image_logo_the_lu svelte-8e9i9g");
    			add_location(img0, file$8, 7, 10, 138);
    			attr_dev(img1, "alt", "imagens");
    			if (!src_url_equal(img1.src, img1_src_value = "./image/iam.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "iam svelte-8e9i9g");
    			add_location(img1, file$8, 8, 10, 217);
    			attr_dev(div0, "class", "image_container svelte-8e9i9g");
    			add_location(div0, file$8, 6, 8, 97);
    			attr_dev(h3, "class", "tittle_secundary svelte-8e9i9g");
    			add_location(h3, file$8, 11, 10, 350);
    			attr_dev(h2, "class", "tittle_firts svelte-8e9i9g");
    			add_location(h2, file$8, 13, 10, 402);
    			attr_dev(hr, "class", "line_firts svelte-8e9i9g");
    			add_location(hr, file$8, 14, 10, 450);
    			attr_dev(p, "class", "paragraph_firt svelte-8e9i9g");
    			add_location(p, file$8, 15, 10, 487);
    			attr_dev(img2, "alt", "imagens");
    			if (!src_url_equal(img2.src, img2_src_value = "./image/twitter.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "svelte-8e9i9g");
    			add_location(img2, file$8, 20, 16, 811);
    			attr_dev(a0, "href", "https://twitter.com/The_Lu33");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$8, 19, 14, 738);
    			attr_dev(button0, "class", "button_social button_twitter svelte-8e9i9g");
    			add_location(button0, file$8, 17, 12, 608);
    			attr_dev(img3, "alt", "imagens");
    			if (!src_url_equal(img3.src, img3_src_value = "./image/linkedin.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "svelte-8e9i9g");
    			add_location(img3, file$8, 28, 17, 1169);
    			attr_dev(a1, "href", "https://www.linkedin.com/in/luisangel-tapia/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$8, 25, 14, 1046);
    			attr_dev(button1, "class", "button_social button_linkedin svelte-8e9i9g");
    			add_location(button1, file$8, 23, 12, 915);
    			attr_dev(img4, "alt", "imagens");
    			if (!src_url_equal(img4.src, img4_src_value = "./image/github.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "class", "svelte-8e9i9g");
    			add_location(img4, file$8, 34, 16, 1474);
    			attr_dev(a2, "href", "https://github.com/The-Lu33");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$8, 33, 14, 1402);
    			attr_dev(button2, "class", "button_social button_github svelte-8e9i9g");
    			add_location(button2, file$8, 31, 12, 1273);
    			attr_dev(div1, "class", "buttons_sociales svelte-8e9i9g");
    			add_location(div1, file$8, 16, 10, 564);
    			attr_dev(article, "class", "presentation_container svelte-8e9i9g");
    			add_location(article, file$8, 10, 8, 298);
    			attr_dev(section, "class", "principal_header svelte-8e9i9g");
    			attr_dev(section, "id", "principal_header");
    			add_location(section, file$8, 5, 4, 31);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, img1);
    			append_dev(section, t1);
    			append_dev(section, article);
    			append_dev(article, h3);
    			append_dev(article, t3);
    			append_dev(article, h2);
    			append_dev(article, t5);
    			append_dev(article, hr);
    			append_dev(article, t6);
    			append_dev(article, p);
    			append_dev(article, t8);
    			append_dev(article, div1);
    			append_dev(div1, button0);
    			append_dev(button0, a0);
    			append_dev(a0, img2);
    			append_dev(div1, t9);
    			append_dev(div1, button1);
    			append_dev(button1, a1);
    			append_dev(a1, img3);
    			append_dev(div1, t10);
    			append_dev(div1, button2);
    			append_dev(button2, a2);
    			append_dev(a2, img4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\lib\About.svelte generated by Svelte v3.52.0 */

    const file$7 = "src\\lib\\About.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let section;
    	let div0;
    	let h2;
    	let t1;
    	let hr;
    	let t2;
    	let div1;
    	let p;

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "About Me";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Programador junior con hambre de éxito, trabajo de manera dura y siempre tratando de buscar el camino mas innovador posible, siempre llevado cada tarea o proyecto a su máxima expresión.\r\n      \r\n            En si un programador junior con pocas experiencias pero con grandes expectativas sobre el mundo tecnológico.";
    			attr_dev(h2, "class", "tittle_about tittles svelte-3r7ylc");
    			add_location(h2, file$7, 7, 10, 163);
    			attr_dev(hr, "class", "line svelte-3r7ylc");
    			add_location(hr, file$7, 8, 10, 221);
    			attr_dev(div0, "class", "container_tittle svelte-3r7ylc");
    			add_location(div0, file$7, 6, 8, 121);
    			attr_dev(p, "class", "paragraph_about svelte-3r7ylc");
    			add_location(p, file$7, 12, 10, 305);
    			attr_dev(div1, "class", "container_p");
    			add_location(div1, file$7, 10, 8, 266);
    			attr_dev(section, "class", "section_about svelte-3r7ylc");
    			attr_dev(section, "id", "section_about");
    			add_location(section, file$7, 4, 4, 53);
    			add_location(main, file$7, 3, 0, 41);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			append_dev(section, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, hr);
    			append_dev(section, t2);
    			append_dev(section, div1);
    			append_dev(div1, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* node_modules\svelte-intersection-observer\src\IntersectionObserver.svelte generated by Svelte v3.52.0 */

    const get_default_slot_changes = dirty => ({
    	intersecting: dirty & /*intersecting*/ 1,
    	entry: dirty & /*entry*/ 2,
    	observer: dirty & /*observer*/ 4
    });

    const get_default_slot_context = ctx => ({
    	intersecting: /*intersecting*/ ctx[0],
    	entry: /*entry*/ ctx[1],
    	observer: /*observer*/ ctx[2]
    });

    function create_fragment$7(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, intersecting, entry, observer*/ 263)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('IntersectionObserver', slots, ['default']);
    	let { element = null } = $$props;
    	let { once = false } = $$props;
    	let { intersecting = false } = $$props;
    	let { root = null } = $$props;
    	let { rootMargin = "0px" } = $$props;
    	let { threshold = 0 } = $$props;
    	let { entry = null } = $$props;
    	let { observer = null } = $$props;
    	const dispatch = createEventDispatcher();
    	let prevRootMargin = null;
    	let prevElement = null;

    	const initialize = () => {
    		$$invalidate(2, observer = new IntersectionObserver(entries => {
    				entries.forEach(_entry => {
    					$$invalidate(1, entry = _entry);
    					$$invalidate(0, intersecting = _entry.isIntersecting);
    				});
    			},
    		{ root, rootMargin, threshold }));
    	};

    	onMount(() => {
    		initialize();

    		return () => {
    			if (observer) {
    				observer.disconnect();
    				$$invalidate(2, observer = null);
    			}
    		};
    	});

    	afterUpdate(async () => {
    		if (entry !== null) {
    			dispatch("observe", entry);

    			if (entry.isIntersecting) {
    				dispatch("intersect", entry);
    				if (once) observer.unobserve(element);
    			}
    		}

    		await tick();

    		if (element !== null && element !== prevElement) {
    			observer.observe(element);
    			if (prevElement !== null) observer.unobserve(prevElement);
    			prevElement = element;
    		}

    		if (prevRootMargin && rootMargin !== prevRootMargin) {
    			observer.disconnect();
    			prevElement = null;
    			initialize();
    		}

    		prevRootMargin = rootMargin;
    	});

    	const writable_props = [
    		'element',
    		'once',
    		'intersecting',
    		'root',
    		'rootMargin',
    		'threshold',
    		'entry',
    		'observer'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<IntersectionObserver> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('element' in $$props) $$invalidate(3, element = $$props.element);
    		if ('once' in $$props) $$invalidate(4, once = $$props.once);
    		if ('intersecting' in $$props) $$invalidate(0, intersecting = $$props.intersecting);
    		if ('root' in $$props) $$invalidate(5, root = $$props.root);
    		if ('rootMargin' in $$props) $$invalidate(6, rootMargin = $$props.rootMargin);
    		if ('threshold' in $$props) $$invalidate(7, threshold = $$props.threshold);
    		if ('entry' in $$props) $$invalidate(1, entry = $$props.entry);
    		if ('observer' in $$props) $$invalidate(2, observer = $$props.observer);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		element,
    		once,
    		intersecting,
    		root,
    		rootMargin,
    		threshold,
    		entry,
    		observer,
    		tick,
    		createEventDispatcher,
    		afterUpdate,
    		onMount,
    		dispatch,
    		prevRootMargin,
    		prevElement,
    		initialize
    	});

    	$$self.$inject_state = $$props => {
    		if ('element' in $$props) $$invalidate(3, element = $$props.element);
    		if ('once' in $$props) $$invalidate(4, once = $$props.once);
    		if ('intersecting' in $$props) $$invalidate(0, intersecting = $$props.intersecting);
    		if ('root' in $$props) $$invalidate(5, root = $$props.root);
    		if ('rootMargin' in $$props) $$invalidate(6, rootMargin = $$props.rootMargin);
    		if ('threshold' in $$props) $$invalidate(7, threshold = $$props.threshold);
    		if ('entry' in $$props) $$invalidate(1, entry = $$props.entry);
    		if ('observer' in $$props) $$invalidate(2, observer = $$props.observer);
    		if ('prevRootMargin' in $$props) prevRootMargin = $$props.prevRootMargin;
    		if ('prevElement' in $$props) prevElement = $$props.prevElement;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		intersecting,
    		entry,
    		observer,
    		element,
    		once,
    		root,
    		rootMargin,
    		threshold,
    		$$scope,
    		slots
    	];
    }

    class IntersectionObserver_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			element: 3,
    			once: 4,
    			intersecting: 0,
    			root: 5,
    			rootMargin: 6,
    			threshold: 7,
    			entry: 1,
    			observer: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IntersectionObserver_1",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get element() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get once() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set once(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get intersecting() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set intersecting(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get root() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rootMargin() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rootMargin(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get entry() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get observer() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set observer(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var IntersectionObserver$1 = IntersectionObserver_1;

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /*
    Adapted from https://github.com/mattdesl
    Distributed under MIT License https://github.com/mattdesl/eases/blob/master/LICENSE.md
    */
    function backInOut(t) {
        const s = 1.70158 * 1.525;
        if ((t *= 2) < 1)
            return 0.5 * (t * t * ((s + 1) * t - s));
        return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    }
    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src\lib\Skillsbars.svelte generated by Svelte v3.52.0 */
    const file$6 = "src\\lib\\Skillsbars.svelte";

    // (24:0) <IntersectionObserver  element={element}  bind:intersecting={intersecting}  once>
    function create_default_slot(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(/*skill*/ ctx[2]);
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(h2, "class", "skill svelte-gs677v");
    			add_location(h2, file$6, 26, 0, 621);
    			attr_dev(div0, "class", "skills svelte-gs677v");
    			set_style(div0, "width", /*$progress*/ ctx[3] + "%");
    			add_location(div0, file$6, 28, 2, 715);
    			attr_dev(div1, "class", "container svelte-gs677v");
    			toggle_class(div1, "intersecting", /*intersecting*/ ctx[0]);
    			add_location(div1, file$6, 27, 0, 653);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[7](div0);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*skill*/ 4) set_data_dev(t0, /*skill*/ ctx[2]);

    			if (dirty & /*$progress*/ 8) {
    				set_style(div0, "width", /*$progress*/ ctx[3] + "%");
    			}

    			if (dirty & /*intersecting*/ 1) {
    				toggle_class(div1, "intersecting", /*intersecting*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			/*div0_binding*/ ctx[7](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(24:0) <IntersectionObserver  element={element}  bind:intersecting={intersecting}  once>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let intersectionobserver;
    	let updating_intersecting;
    	let current;

    	function intersectionobserver_intersecting_binding(value) {
    		/*intersectionobserver_intersecting_binding*/ ctx[8](value);
    	}

    	let intersectionobserver_props = {
    		element: /*element*/ ctx[1],
    		once: true,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*intersecting*/ ctx[0] !== void 0) {
    		intersectionobserver_props.intersecting = /*intersecting*/ ctx[0];
    	}

    	intersectionobserver = new IntersectionObserver$1({
    			props: intersectionobserver_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(intersectionobserver, 'intersecting', intersectionobserver_intersecting_binding));

    	const block = {
    		c: function create() {
    			create_component(intersectionobserver.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(intersectionobserver, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const intersectionobserver_changes = {};
    			if (dirty & /*element*/ 2) intersectionobserver_changes.element = /*element*/ ctx[1];

    			if (dirty & /*$$scope, intersecting, $progress, element, skill*/ 527) {
    				intersectionobserver_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_intersecting && dirty & /*intersecting*/ 1) {
    				updating_intersecting = true;
    				intersectionobserver_changes.intersecting = /*intersecting*/ ctx[0];
    				add_flush_callback(() => updating_intersecting = false);
    			}

    			intersectionobserver.$set(intersectionobserver_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersectionobserver.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersectionobserver.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(intersectionobserver, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $progress;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skillsbars', slots, []);
    	let { skill } = $$props;
    	let { percent } = $$props;
    	let { delTime } = $$props;

    	const progress = tweened(30, {
    		delay: delTime,
    		duration: 2000,
    		easing: backInOut
    	});

    	validate_store(progress, 'progress');
    	component_subscribe($$self, progress, value => $$invalidate(3, $progress = value));
    	let { element } = $$props;
    	let { intersecting } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (skill === undefined && !('skill' in $$props || $$self.$$.bound[$$self.$$.props['skill']])) {
    			console.warn("<Skillsbars> was created without expected prop 'skill'");
    		}

    		if (percent === undefined && !('percent' in $$props || $$self.$$.bound[$$self.$$.props['percent']])) {
    			console.warn("<Skillsbars> was created without expected prop 'percent'");
    		}

    		if (delTime === undefined && !('delTime' in $$props || $$self.$$.bound[$$self.$$.props['delTime']])) {
    			console.warn("<Skillsbars> was created without expected prop 'delTime'");
    		}

    		if (element === undefined && !('element' in $$props || $$self.$$.bound[$$self.$$.props['element']])) {
    			console.warn("<Skillsbars> was created without expected prop 'element'");
    		}

    		if (intersecting === undefined && !('intersecting' in $$props || $$self.$$.bound[$$self.$$.props['intersecting']])) {
    			console.warn("<Skillsbars> was created without expected prop 'intersecting'");
    		}
    	});

    	const writable_props = ['skill', 'percent', 'delTime', 'element', 'intersecting'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skillsbars> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	function intersectionobserver_intersecting_binding(value) {
    		intersecting = value;
    		$$invalidate(0, intersecting);
    	}

    	$$self.$$set = $$props => {
    		if ('skill' in $$props) $$invalidate(2, skill = $$props.skill);
    		if ('percent' in $$props) $$invalidate(5, percent = $$props.percent);
    		if ('delTime' in $$props) $$invalidate(6, delTime = $$props.delTime);
    		if ('element' in $$props) $$invalidate(1, element = $$props.element);
    		if ('intersecting' in $$props) $$invalidate(0, intersecting = $$props.intersecting);
    	};

    	$$self.$capture_state = () => ({
    		IntersectionObserver: IntersectionObserver$1,
    		tweened,
    		backInOut,
    		skill,
    		percent,
    		delTime,
    		progress,
    		element,
    		intersecting,
    		$progress
    	});

    	$$self.$inject_state = $$props => {
    		if ('skill' in $$props) $$invalidate(2, skill = $$props.skill);
    		if ('percent' in $$props) $$invalidate(5, percent = $$props.percent);
    		if ('delTime' in $$props) $$invalidate(6, delTime = $$props.delTime);
    		if ('element' in $$props) $$invalidate(1, element = $$props.element);
    		if ('intersecting' in $$props) $$invalidate(0, intersecting = $$props.intersecting);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*intersecting, percent*/ 33) {
    			intersecting && progress.set(percent);
    		}
    	};

    	return [
    		intersecting,
    		element,
    		skill,
    		$progress,
    		progress,
    		percent,
    		delTime,
    		div0_binding,
    		intersectionobserver_intersecting_binding
    	];
    }

    class Skillsbars extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			skill: 2,
    			percent: 5,
    			delTime: 6,
    			element: 1,
    			intersecting: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skillsbars",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get skill() {
    		throw new Error("<Skillsbars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set skill(value) {
    		throw new Error("<Skillsbars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get percent() {
    		throw new Error("<Skillsbars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set percent(value) {
    		throw new Error("<Skillsbars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delTime() {
    		throw new Error("<Skillsbars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delTime(value) {
    		throw new Error("<Skillsbars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get element() {
    		throw new Error("<Skillsbars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<Skillsbars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get intersecting() {
    		throw new Error("<Skillsbars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set intersecting(value) {
    		throw new Error("<Skillsbars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\lib\Skrills.svelte generated by Svelte v3.52.0 */
    const file$5 = "src\\lib\\Skrills.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i].skill;
    	child_ctx[2] = list[i].percent;
    	child_ctx[3] = list[i].delTime;
    	return child_ctx;
    }

    // (25:6) {#each skillLevels as { skill, percent, delTime }}
    function create_each_block$1(ctx) {
    	let skillbar;
    	let current;

    	skillbar = new Skillsbars({
    			props: {
    				skill: /*skill*/ ctx[1],
    				percent: /*percent*/ ctx[2],
    				delTime: /*delTime*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(skillbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(skillbar, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(skillbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(skillbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(skillbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(25:6) {#each skillLevels as { skill, percent, delTime }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section;
    	let div1;
    	let div0;
    	let h2;
    	let t1;
    	let hr;
    	let t2;
    	let current;
    	let each_value = /*skillLevels*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "SKills";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "tittle_skrills tittles svelte-7s3zc3");
    			add_location(h2, file$5, 21, 8, 503);
    			attr_dev(hr, "class", "line svelte-7s3zc3");
    			add_location(hr, file$5, 22, 8, 559);
    			attr_dev(div0, "class", "container_tittle");
    			add_location(div0, file$5, 20, 6, 463);
    			attr_dev(div1, "class", "section_skrills svelte-7s3zc3");
    			add_location(div1, file$5, 19, 4, 425);
    			attr_dev(section, "class", "container_sk svelte-7s3zc3");
    			attr_dev(section, "id", "section_skrills");
    			add_location(section, file$5, 18, 2, 368);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, hr);
    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*skillLevels*/ 1) {
    				each_value = /*skillLevels*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skrills', slots, []);

    	const skillLevels = [
    		{
    			skill: "Frontend Developer",
    			percent: 90,
    			delTime: 0
    		},
    		{
    			skill: "Backend Developer",
    			percent: 65,
    			delTime: 400
    		},
    		{
    			skill: "Desiguer UX/UI",
    			percent: 80,
    			delTime: 700
    		},
    		{
    			skill: "Web Desiguer",
    			percent: 75,
    			delTime: 1000
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skrills> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Skillbar: Skillsbars, skillLevels });
    	return [skillLevels];
    }

    class Skrills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skrills",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\lib\Techonologies.svelte generated by Svelte v3.52.0 */

    const file$4 = "src\\lib\\Techonologies.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div0;
    	let h2;
    	let t1;
    	let hr;
    	let t2;
    	let div7;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t3;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t4;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t5;
    	let div4;
    	let img3;
    	let img3_src_value;
    	let t6;
    	let div5;
    	let img4;
    	let img4_src_value;
    	let t7;
    	let div6;
    	let img5;
    	let img5_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Technologies";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			div7 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t3 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t4 = space();
    			div3 = element("div");
    			img2 = element("img");
    			t5 = space();
    			div4 = element("div");
    			img3 = element("img");
    			t6 = space();
    			div5 = element("div");
    			img4 = element("img");
    			t7 = space();
    			div6 = element("div");
    			img5 = element("img");
    			attr_dev(h2, "class", "tittle_techonologies tittles svelte-m8uwfs");
    			add_location(h2, file$4, 5, 6, 155);
    			attr_dev(hr, "class", "line svelte-m8uwfs");
    			add_location(hr, file$4, 6, 6, 221);
    			attr_dev(div0, "class", "container_tittle");
    			add_location(div0, file$4, 4, 4, 117);
    			if (!src_url_equal(img0.src, img0_src_value = "./image/js.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-m8uwfs");
    			add_location(img0, file$4, 9, 29, 322);
    			attr_dev(div1, "class", "box_skill svelte-m8uwfs");
    			add_location(div1, file$4, 9, 6, 299);
    			if (!src_url_equal(img1.src, img1_src_value = "./image/html5.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "icon_techonologies");
    			attr_dev(img1, "class", "svelte-m8uwfs");
    			add_location(img1, file$4, 11, 8, 404);
    			attr_dev(div2, "class", "box_skill svelte-m8uwfs");
    			add_location(div2, file$4, 10, 6, 371);
    			if (!src_url_equal(img2.src, img2_src_value = "./image/css3-alt.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "icon_techonologies");
    			attr_dev(img2, "class", "svelte-m8uwfs");
    			add_location(img2, file$4, 14, 8, 515);
    			attr_dev(div3, "class", "box_skill svelte-m8uwfs");
    			add_location(div3, file$4, 13, 6, 482);
    			if (!src_url_equal(img3.src, img3_src_value = "./image/node-js.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "icon_techonologies");
    			attr_dev(img3, "class", "svelte-m8uwfs");
    			add_location(img3, file$4, 17, 8, 629);
    			attr_dev(div4, "class", "box_skill svelte-m8uwfs");
    			add_location(div4, file$4, 16, 6, 596);
    			if (!src_url_equal(img4.src, img4_src_value = "./image/react.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "icon_techonologies");
    			attr_dev(img4, "class", "svelte-m8uwfs");
    			add_location(img4, file$4, 20, 8, 742);
    			attr_dev(div5, "class", "box_skill svelte-m8uwfs");
    			add_location(div5, file$4, 19, 6, 709);
    			if (!src_url_equal(img5.src, img5_src_value = "./image/figma.svg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			attr_dev(img5, "class", "svelte-m8uwfs");
    			add_location(img5, file$4, 23, 8, 853);
    			attr_dev(div6, "class", "box_skill svelte-m8uwfs");
    			add_location(div6, file$4, 22, 6, 820);
    			attr_dev(div7, "class", "technologies_skills svelte-m8uwfs");
    			add_location(div7, file$4, 8, 4, 258);
    			attr_dev(section, "class", "techonologies_container svelte-m8uwfs");
    			attr_dev(section, "id", "techonologies_container");
    			add_location(section, file$4, 3, 0, 41);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, hr);
    			append_dev(section, t2);
    			append_dev(section, div7);
    			append_dev(div7, div1);
    			append_dev(div1, img0);
    			append_dev(div7, t3);
    			append_dev(div7, div2);
    			append_dev(div2, img1);
    			append_dev(div7, t4);
    			append_dev(div7, div3);
    			append_dev(div3, img2);
    			append_dev(div7, t5);
    			append_dev(div7, div4);
    			append_dev(div4, img3);
    			append_dev(div7, t6);
    			append_dev(div7, div5);
    			append_dev(div5, img4);
    			append_dev(div7, t7);
    			append_dev(div7, div6);
    			append_dev(div6, img5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Techonologies', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Techonologies> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Techonologies extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Techonologies",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    function hslide(node, {
    	delay = 0,
    	duration = 120,
    	easing = cubicInOut
    })  {
    	const style = getComputedStyle(node);
    	const opacity = +style.opacity;
    	const width = parseFloat(style.width);
    	const padding_left = parseFloat(style.paddingLeft);
    	const padding_right = parseFloat(style.paddingRight);
    	const margin_left = parseFloat(style.marginLeft);
    	const margin_right = parseFloat(style.marginRight);
    	const border_left_width = parseFloat(style.borderLeftWidth);
    	const border_right_width = parseFloat(style.borderRightWidth);

    	return {
    		delay,
    		duration,
    		easing,
    		css: t =>
    			`overflow: hidden;` +
    			`opacity: ${Math.min(t * 20, 1) * opacity};` +
    			`width: ${t * width}px;` +
    			`padding-left: ${t * padding_left}px;` +
    			`padding-right: ${t * padding_right}px;` +
    			`margin-left: ${t * margin_left}px;` +
    			`margin-right: ${t * margin_right}px;` +
    			`border-left-width: ${t * border_left_width}px;` +
    			`border-right-width: ${t * border_right_width}px;`
    	};
    }

    /* src\lib\Briefcase.svelte generated by Svelte v3.52.0 */
    const file$3 = "src\\lib\\Briefcase.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (47:6) {#if id===car}
    function create_if_block$1(ctx) {
    	let img;
    	let img_src_value;
    	let img_intro;
    	let img_outro;
    	let current;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*slides*/ ctx[1][/*car*/ ctx[0]].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "slide");
    			attr_dev(img, "class", "slide_img svelte-13fo1jt");
    			add_location(img, file$3, 47, 6, 1070);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*car*/ 1 && !src_url_equal(img.src, img_src_value = /*slides*/ ctx[1][/*car*/ ctx[0]].img)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (img_outro) img_outro.end(1);
    				img_intro = create_in_transition(img, hslide, /*transition_args*/ ctx[2]);
    				img_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (img_intro) img_intro.invalidate();
    			img_outro = create_out_transition(img, hslide, /*transition_args*/ ctx[2]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching && img_outro) img_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(47:6) {#if id===car}",
    		ctx
    	});

    	return block;
    }

    // (46:6) {#each slides as slide,id}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*id*/ ctx[12] === /*car*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*id*/ ctx[12] === /*car*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*car*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(46:6) {#each slides as slide,id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let div0;
    	let h2;
    	let t1;
    	let hr;
    	let t2;
    	let div3;
    	let div2;
    	let div1;
    	let t3;
    	let button0;
    	let t5;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*slides*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Briefcase";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "◀";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "▶";
    			attr_dev(h2, "class", "tittle_briefcase tittles svelte-13fo1jt");
    			add_location(h2, file$3, 38, 4, 817);
    			attr_dev(hr, "class", "line svelte-13fo1jt");
    			add_location(hr, file$3, 39, 4, 874);
    			attr_dev(div0, "class", "container_tittle");
    			add_location(div0, file$3, 37, 2, 781);
    			attr_dev(div1, "class", "slide_wal svelte-13fo1jt");
    			add_location(div1, file$3, 44, 5, 983);
    			attr_dev(button0, "class", "arrow left svelte-13fo1jt");
    			attr_dev(button0, "id", "arrow_left arrow");
    			add_location(button0, file$3, 54, 5, 1254);
    			attr_dev(button1, "class", "arrow rigth svelte-13fo1jt");
    			attr_dev(button1, "id", "arrow_rigth arrow");
    			add_location(button1, file$3, 55, 6, 1351);
    			attr_dev(div2, "class", "container_slide svelte-13fo1jt");
    			add_location(div2, file$3, 43, 4, 947);
    			attr_dev(div3, "class", "briefcase_carrusel svelte-13fo1jt");
    			add_location(div3, file$3, 42, 2, 909);
    			attr_dev(section, "class", "briefcase_container svelte-13fo1jt");
    			attr_dev(section, "id", "briefcase_container");
    			add_location(section, file$3, 36, 0, 715);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, hr);
    			append_dev(section, t2);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t3);
    			append_dev(div2, button0);
    			append_dev(div2, t5);
    			append_dev(div2, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*slides, car, transition_args*/ 7) {
    				each_value = /*slides*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const arrowLeft = 37;
    const arrowRight = 39;

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Briefcase', slots, []);

    	let slides = [
    		{ id: 1, img: "./image/0.jpg" },
    		{ id: 1, img: "./image/0.jpg" },
    		{ id: 1, img: "./image/0.jpg" }
    	];

    	let car = 0;

    	function changeSlide(slide) {
    		$$invalidate(0, car = slide);
    	}

    	const change = (num, min, max) => Math.min(Math.max(num, min), max);
    	const transition_args = { duration: 700, delay: 10 };

    	function next(e) {
    		$$invalidate(0, car = change(car + 1, 0, slides.length - 1));
    	}

    	function prev(e) {
    		$$invalidate(0, car = change(car - 1, 0, slides.length - 1));
    	}

    	function handlechange(e) {
    		if (e.keyCode === arrowLeft) {
    			prev();
    		}

    		if (e.keyCode === arrowRight) {
    			next();
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Briefcase> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => prev();
    	const click_handler_1 = () => next();

    	$$self.$capture_state = () => ({
    		hslide,
    		slides,
    		car,
    		changeSlide,
    		change,
    		transition_args,
    		next,
    		prev,
    		arrowLeft,
    		arrowRight,
    		handlechange
    	});

    	$$self.$inject_state = $$props => {
    		if ('slides' in $$props) $$invalidate(1, slides = $$props.slides);
    		if ('car' in $$props) $$invalidate(0, car = $$props.car);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [car, slides, transition_args, next, prev, click_handler, click_handler_1];
    }

    class Briefcase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Briefcase",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\lib\Contact.svelte generated by Svelte v3.52.0 */

    const file$2 = "src\\lib\\Contact.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div0;
    	let h2;
    	let t1;
    	let hr;
    	let t2;
    	let div1;
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Contact";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			div1 = element("div");
    			a = element("a");
    			img = element("img");
    			attr_dev(h2, "class", "tittle_contact tittles svelte-130er5p");
    			add_location(h2, file$2, 6, 6, 135);
    			attr_dev(hr, "class", "line svelte-130er5p");
    			add_location(hr, file$2, 7, 6, 190);
    			attr_dev(div0, "class", "container_tittle");
    			add_location(div0, file$2, 4, 4, 95);
    			if (!src_url_equal(img.src, img_src_value = "./image/email.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "email");
    			attr_dev(img, "class", "svelte-130er5p");
    			add_location(img, file$2, 11, 8, 338);
    			attr_dev(a, "href", "mailto:luiseducol13@gmail.com");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 10, 6, 272);
    			attr_dev(div1, "class", "contact_image_container svelte-130er5p");
    			add_location(div1, file$2, 9, 4, 227);
    			attr_dev(section, "class", "contact_container svelte-130er5p");
    			attr_dev(section, "id", "contact");
    			add_location(section, file$2, 3, 0, 41);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, hr);
    			append_dev(section, t2);
    			append_dev(section, div1);
    			append_dev(div1, a);
    			append_dev(a, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\lib\Footer.svelte generated by Svelte v3.52.0 */

    const file$1 = "src\\lib\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let h2;
    	let t0;
    	let span0;
    	let img;
    	let img_src_value;
    	let t1;
    	let span1;
    	let t3;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			h2 = element("h2");
    			t0 = text("Made with ");
    			span0 = element("span");
    			img = element("img");
    			t1 = text("lots of  ");
    			span1 = element("span");
    			span1.textContent = "❤️";
    			t3 = text(" by The Lú");
    			if (!src_url_equal(img.src, img_src_value = "./image/svelte.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "icono");
    			add_location(img, file$1, 4, 46, 97);
    			add_location(span0, file$1, 4, 40, 91);
    			add_location(span1, file$1, 4, 104, 155);
    			attr_dev(h2, "class", "tittle_footer svelte-15vnsvz");
    			add_location(h2, file$1, 4, 4, 55);
    			attr_dev(footer, "class", "svelte-15vnsvz");
    			add_location(footer, file$1, 3, 0, 41);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, h2);
    			append_dev(h2, t0);
    			append_dev(h2, span0);
    			append_dev(span0, img);
    			append_dev(h2, t1);
    			append_dev(h2, span1);
    			append_dev(h2, t3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.52.0 */
    const file = "src\\App.svelte";

    // (24:0) {#if !load}
    function create_if_block(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "!Hello World!...";
    			attr_dev(span, "class", "load svelte-1k8hddn");
    			add_location(span, file, 25, 4, 605);
    			attr_dev(div, "class", "loader_container svelte-1k8hddn");
    			add_location(div, file, 24, 2, 570);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(24:0) {#if !load}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let header1;
    	let nabvar;
    	let t1;
    	let header0;
    	let t2;
    	let main;
    	let about;
    	let t3;
    	let skrills;
    	let t4;
    	let techonologies;
    	let t5;
    	let briefcase;
    	let t6;
    	let contact;
    	let t7;
    	let footer;
    	let current;
    	let if_block = !/*load*/ ctx[0] && create_if_block(ctx);
    	nabvar = new Nabvar({ $$inline: true });
    	header0 = new Header({ $$inline: true });
    	about = new About({ $$inline: true });
    	skrills = new Skrills({ $$inline: true });
    	techonologies = new Techonologies({ $$inline: true });
    	briefcase = new Briefcase({ $$inline: true });
    	contact = new Contact({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			header1 = element("header");
    			create_component(nabvar.$$.fragment);
    			t1 = space();
    			create_component(header0.$$.fragment);
    			t2 = space();
    			main = element("main");
    			create_component(about.$$.fragment);
    			t3 = space();
    			create_component(skrills.$$.fragment);
    			t4 = space();
    			create_component(techonologies.$$.fragment);
    			t5 = space();
    			create_component(briefcase.$$.fragment);
    			t6 = space();
    			create_component(contact.$$.fragment);
    			t7 = space();
    			create_component(footer.$$.fragment);
    			add_location(header1, file, 28, 0, 663);
    			add_location(main, file, 32, 0, 708);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, header1, anchor);
    			mount_component(nabvar, header1, null);
    			append_dev(header1, t1);
    			mount_component(header0, header1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(about, main, null);
    			append_dev(main, t3);
    			mount_component(skrills, main, null);
    			append_dev(main, t4);
    			mount_component(techonologies, main, null);
    			append_dev(main, t5);
    			mount_component(briefcase, main, null);
    			append_dev(main, t6);
    			mount_component(contact, main, null);
    			insert_dev(target, t7, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*load*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nabvar.$$.fragment, local);
    			transition_in(header0.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(skrills.$$.fragment, local);
    			transition_in(techonologies.$$.fragment, local);
    			transition_in(briefcase.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nabvar.$$.fragment, local);
    			transition_out(header0.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(skrills.$$.fragment, local);
    			transition_out(techonologies.$$.fragment, local);
    			transition_out(briefcase.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header1);
    			destroy_component(nabvar);
    			destroy_component(header0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(main);
    			destroy_component(about);
    			destroy_component(skrills);
    			destroy_component(techonologies);
    			destroy_component(briefcase);
    			destroy_component(contact);
    			if (detaching) detach_dev(t7);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let load = false;

    	onMount(() => {
    		setTimeout(
    			() => {
    				$$invalidate(0, load = true);
    			},
    			5000
    		);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Nabvar,
    		Header,
    		About,
    		Skrills,
    		Techonologies,
    		Briefcase,
    		Contact,
    		Footer,
    		onMount,
    		load
    	});

    	$$self.$inject_state = $$props => {
    		if ('load' in $$props) $$invalidate(0, load = $$props.load);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [load];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,

    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
