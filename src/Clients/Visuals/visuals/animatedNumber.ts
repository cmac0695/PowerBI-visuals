/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/// <reference path="../_references.ts"/>

module powerbi.visuals {
    /**
     * Renders a number that can be animate change in value.
     */
    export class AnimatedNumber extends AnimatedText implements IVisual {
        private options: VisualInitOptions;

        // TODO: Remove this once all visuals have implemented update.
        private dataViews: DataView[];
        private formatter: IValueFormatter;

        public constructor(svg?: D3.Selection, animator?: IGenericAnimator) {
            super('animatedNumber');

            if (svg)
                this.svg = svg;
            if (animator)
                this.animator = animator;
        }

        public init(options: VisualInitOptions) {
            this.options = options;
            let element = options.element;

            if (!this.svg)
                this.svg = d3.select(element.get(0)).append('svg');

            this.currentViewport = options.viewport;
            this.hostServices = options.host;
            this.style = options.style;
            this.updateViewportDependantProperties();
        }

        public updateViewportDependantProperties() {
            let viewport = this.currentViewport;
            this.svg.attr('width', viewport.width)
                .attr('height', viewport.height);
        }

        public update(options: VisualUpdateOptions) {
            debug.assertValue(options, 'options');

            this.currentViewport = options.viewport;
            let dataViews = this.dataViews = options.dataViews;

            if (!dataViews || !dataViews[0]) {
                return;
            }

            let dataView = dataViews[0];
            this.updateViewportDependantProperties();
            this.getMetaDataColumn(dataView);
            let newValue = dataView && dataView.single ? dataView.single.value : 0;
            this.updateInternal(newValue, options.suppressAnimations, true, this.formatter);
        }

        public setFormatter(formatter?: IValueFormatter): void {
            this.formatter = formatter;
        }

        public onDataChanged(options: VisualDataChangedOptions): void {
            // TODO: Remove onDataChanged & onResizing once all visuals have implemented update.
            this.update({
                dataViews: options.dataViews,
                suppressAnimations: options.suppressAnimations,
                viewport: this.currentViewport
            });
        }

        public onResizing(viewport: IViewport): void {
            // TODO: Remove onDataChanged & onResizing once all visuals have implemented update.
            this.update({
                dataViews: this.dataViews,
                suppressAnimations: true,
                viewport: viewport
            });
        }

        public canResizeTo(viewport: IViewport): boolean {
            // Temporarily disabling resize restriction.
            return true;
        }

        private updateInternal(target: number, suppressAnimations: boolean, forceUpdate: boolean = false, formatter?: IValueFormatter) {
            let start = this.value;
            let duration = AnimatorCommon.GetAnimationDuration(this.animator, suppressAnimations);

            this.doValueTransition(
                start,
                target,
                /*displayUnitSystemType*/ null,
                this.options.animation,
                duration,
                forceUpdate,
                formatter);

            this.value = target;
        }
    }
}