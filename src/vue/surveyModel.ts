import {SurveyModel} from "../survey";
import {surveyCss} from "../defaultCss/cssstandard"

export class VueSurveyModel extends SurveyModel {
    private vueValuesHash: {[index: string]: any} = {};
    renderCallback: () => void;
    constructor(jsonObj: any = null) {
        super(jsonObj);
        this.getAllQuestions().forEach(question => this.vueValuesHash[question.name] = undefined);
    }
    public render() {
        if (this.renderCallback) {
            this.renderCallback();
        }
    }
    protected onLoadSurveyFromService() {
        this.render();
    }
    protected onLoadingSurveyFromService() {
        this.render();
    }
    get css () {
        return surveyCss.getCss();
    }
    set css(value: any) {
        this.mergeValues(value, this.css);
    }
    getValue(name: string): any {
        if (!name || name.length === 0) return null;
        var value = this.vueValuesHash[name];
        return super.getUnbindValue(value);
    }
    setValue(name: string, newValue: any) {
        this.vueValuesHash[name] = newValue;
        super.setValue(name, newValue);
    }

}