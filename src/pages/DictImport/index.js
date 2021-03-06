import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Map, fromJS } from 'immutable';
import { Message, Button, Step } from 'semantic-ui-react';
import { getTranslation } from 'api/i18n';

import {
  setBlobs,
  nextStep,
  goToStep,
  linkingAdd,
  linkingDelete,
  updateColumn,
  toggleAddColumn,
  setColumnType,
  setLanguage,
  setTranslation,
  selectors,
} from 'ducks/dictImport';

import Linker from './Linker';
import ColumnMapper from './ColumnMapper';
import LanguageSelection from './LanguageSelection';

import './styles.scss';

import { buildExport } from './api';

export const fieldsQuery = gql`
  query field {
    all_fields {
      id
      translation
      data_type
      data_type_translation_gist_id
    }
    user_blobs(data_type: "starling/csv") {
      id
      data_type
      name
      created_at
      additional_metadata {
        starling_fields
      }
    }
  }
`;

const convertMutation = gql`
  mutation convertMutation($starling_dictionaries: [StarlingDictionary]!) {
    convert_starling(starling_dictionaries: $starling_dictionaries) {
      triumph
    }
  }
`;

class Info extends React.Component {
  static propTypes = {
    data: PropTypes.shape({ loading: PropTypes.bool.isRequired }).isRequired,
    step: PropTypes.string.isRequired,
    isNextStep: PropTypes.bool.isRequired,
    blobs: PropTypes.any.isRequired,
    linking: PropTypes.any.isRequired,
    spreads: PropTypes.any.isRequired,
    columnTypes: PropTypes.any.isRequired,
    languages: PropTypes.any.isRequired,
    locales: PropTypes.array.isRequired,
    setBlobs: PropTypes.func.isRequired,
    nextStep: PropTypes.func.isRequired,
    goToStep: PropTypes.func.isRequired,
    linkingAdd: PropTypes.func.isRequired,
    linkingDelete: PropTypes.func.isRequired,
    updateColumn: PropTypes.func.isRequired,
    toggleAddColumn: PropTypes.func.isRequired,
    setColumnType: PropTypes.func.isRequired,
    setLanguage: PropTypes.func.isRequired,
    setTranslation: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onNextClick = this.onNextClick.bind(this);
    this.onStepClick = this.onStepClick.bind(this);
    this.onUpdateColumn = this.onUpdateColumn.bind(this);
    this.onToggleColumn = this.onToggleColumn.bind(this);
    this.onSetColumnType = this.onSetColumnType.bind(this);
    this.onSetLanguage = this.onSetLanguage.bind(this);
    this.onSetTranslation = this.onSetTranslation.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(props) {
    const { data: { loading, error, user_blobs: blobs } } = props;
    if (!loading && !error) {
      const newBlobs = fromJS(blobs.filter(b => b.data_type === 'starling/csv')).map(v => v.set('values', new Map()));
      // XXX: Ugly workaround
      if (JSON.stringify(this.props.blobs) !== JSON.stringify(newBlobs)) {
        this.props.setBlobs(newBlobs);
      }
    }
  }

  onSelect(payload) {
    this.props.linkingAdd(payload);
  }

  onDelete(payload) {
    this.props.linkingDelete(payload);
  }

  onNextClick() {
    this.props.nextStep();
  }

  onStepClick(name) {
    return () => this.props.goToStep(name);
  }

  onUpdateColumn(id) {
    return (column, value, oldValue) => this.props.updateColumn(id, column, value, oldValue);
  }

  onToggleColumn(id) {
    return () => this.props.toggleAddColumn(id);
  }

  onSetColumnType(id) {
    return column => field => this.props.setColumnType(id, column, field);
  }

  onSetLanguage(id) {
    return language => this.props.setLanguage(id, language);
  }

  onSetTranslation(id) {
    return (locale, value) => this.props.setTranslation(id, locale, value);
  }

  onSubmit() {
    const { convert } = this.props;
    const params = buildExport(this.props);
    convert({
      variables: { starling_dictionaries: params },
    }).then(() => this.props.goToStep('FINISH'));
  }

  render() {
    const {
      step, isNextStep, blobs, linking, spreads, columnTypes, languages, locales, data,
    } = this.props;

    if (data.loading || data.error) {
      return null;
    }

    const { all_fields: fields } = data;
    const fieldTypes = fromJS(fields).filter(field => field.get('data_type') === 'Text');

    return (
      <div>
        <Step.Group widths={4}>
          <Step link active={step === 'LINKING'} onClick={this.onStepClick('LINKING')}>
            <Step.Content>
              <Step.Title>{getTranslation('Linking')}</Step.Title>
              <Step.Description>{getTranslation('Link columns from files with each other')}</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === 'COLUMNS'} onClick={this.onStepClick('COLUMNS')}>
            <Step.Content>
              <Step.Title>{getTranslation('Columns Mapping')}</Step.Title>
              <Step.Description>{getTranslation('Map linked columns to LingvoDoc types')}</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === 'LANGUAGES'} onClick={this.onStepClick('LANGUAGES')}>
            <Step.Content>
              <Step.Title>{getTranslation('Language Selection')}</Step.Title>
              <Step.Description>{getTranslation('Map dictionaries to LingvoDoc languages')}</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === 'FINISH'}>
            <Step.Content>
              <Step.Title>{getTranslation('Finish')}</Step.Title>
            </Step.Content>
          </Step>
        </Step.Group>

        <div style={{ minHeight: '400px', background: 'white' }}>
          {step === 'LINKING' && (
            <Linker
              blobs={blobs}
              state={linking}
              spreads={spreads}
              onSelect={this.onSelect}
              onDelete={this.onDelete}
              onUpdateColumn={this.onUpdateColumn}
              onToggleColumn={this.onToggleColumn}
            />
          )}
          {step === 'COLUMNS' && (
            <ColumnMapper
              state={linking}
              spreads={spreads}
              columnTypes={columnTypes}
              types={fieldTypes}
              onSetColumnType={this.onSetColumnType}
            />
          )}
          {step === 'LANGUAGES' && (
            <LanguageSelection
              state={linking}
              languages={languages}
              locales={locales}
              onSetLanguage={this.onSetLanguage}
              onSetTranslation={this.onSetTranslation}
            />
          )}
          {step === 'FINISH' && (
            <Message>
              <Message.Header>{getTranslation('Conversion is in progress...')}</Message.Header>
              <Message.Content>
                {getTranslation('Your dictionaries are scheduled for conversion. Please, check tasks tab for conversion status.')}
              </Message.Content>
            </Message>
          )}
        </div>
        {step === 'LANGUAGES' && (
          <Button fluid color="blue" onClick={this.onSubmit}>
            {getTranslation('Submit')}
          </Button>
        )}
        {isNextStep && (
          <Button fluid color="blue" onClick={this.onNextClick}>
            {getTranslation('Next Step')}
          </Button>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    step: selectors.getStep(state),
    isNextStep: selectors.getNextStep(state),
    blobs: selectors.getBlobs(state),
    linking: selectors.getLinking(state),
    spreads: selectors.getSpreads(state),
    columnTypes: selectors.getColumnTypes(state),
    languages: selectors.getLanguages(state),
    locales: state.locale.locales,
  };
}

const mapDispatchToProps = {
  setBlobs,
  nextStep,
  goToStep,
  linkingAdd,
  linkingDelete,
  updateColumn,
  toggleAddColumn,
  setColumnType,
  setLanguage,
  setTranslation,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(fieldsQuery),
  graphql(convertMutation, { name: 'convert' })
)(Info);
