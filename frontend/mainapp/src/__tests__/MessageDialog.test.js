import React, {Component} from 'react';
import MessageDialog from '../components/MessageDialog';
import TestRenderer from 'react-test-renderer';
import ReactTestUtils from 'react-dom/test-utils';
import {shallow, configure, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { withStyles, MuiThemeProvider } from 'material-ui/styles';
import createContext from '../styles/createContext';
import toJson from 'enzyme-to-json';
configure({ adapter: new Adapter() });
const context = createContext();
const setup = () => {
  const props = {
    onRequestClose: jest.fn(),
    onRequestConfirm: jest.fn(),
    closeText:'close',
    confirmText:'confirm',
    open:true,
    title:'title'
  }
  const wrapper = shallow(
    <MessageDialog {...props} >
      <div>
        content
      </div>
    </MessageDialog>
  ).dive()
  return {
    props,
    wrapper
  }
}

test('renders correctly && click callback correctly', () => {
  const {wrapper, props} = setup();
  expect(wrapper).toMatchSnapshot();

  wrapper.find('#cancel').simulate('click');
  expect(props.onRequestClose).toHaveBeenCalledTimes(1)
  expect(props.onRequestConfirm).toHaveBeenCalledTimes(0)

  wrapper.find('#confirm').simulate('click');
  expect(props.onRequestClose).toHaveBeenCalledTimes(1)
  expect(props.onRequestConfirm).toHaveBeenCalledTimes(1)
});