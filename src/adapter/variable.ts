import { ObjectGripAdapter } from './index';
import { FirefoxDebugSession } from '../firefoxDebugSession';
import { Variable } from 'vscode-debugadapter';

export class VariableAdapter {
	
	public static getVariableFromGrip(varname: string, grip: FirefoxDebugProtocol.Grip, extendLifetime: boolean, debugSession: FirefoxDebugSession): Variable {

		if ((typeof grip === 'boolean') || (typeof grip === 'number')) {

			return new Variable(varname, grip.toString());

		} else if (typeof grip === 'string') {

			return new Variable(varname, `"${grip}"`);

		} else {

			switch (grip.type) {

				case 'null':
				case 'undefined':
				case 'Infinity':
				case '-Infinity':
				case 'NaN':
				case '-0':

					return new Variable(varname, grip.type);

				case 'longString':

					return new Variable(varname, (<FirefoxDebugProtocol.LongStringGrip>grip).initial);

				case 'object':

					let objectGrip = <FirefoxDebugProtocol.ObjectGrip>grip;
					let vartype = objectGrip.class;
					let variablesProvider = new ObjectGripAdapter(objectGrip, extendLifetime, debugSession);
					return new Variable(varname, vartype, variablesProvider.variablesProviderId);

			}
		}
	}

	public static getVariableFromPropertyDescriptor(varname: string, propertyDescriptor: FirefoxDebugProtocol.PropertyDescriptor, 
		extendLifetime: boolean, debugSession: FirefoxDebugSession): Variable {
			
		if ((<FirefoxDebugProtocol.DataPropertyDescriptor>propertyDescriptor).value !== undefined) {
			return VariableAdapter.getVariableFromGrip(varname, (<FirefoxDebugProtocol.DataPropertyDescriptor>propertyDescriptor).value, extendLifetime, debugSession);
		} else {
			return new Variable(varname, 'unknown');
		}
	}

	public static getVariableFromSafeGetterValueDescriptor(varname: string, 
		safeGetterValueDescriptor: FirefoxDebugProtocol.SafeGetterValueDescriptor, 
		extendLifetime: boolean, debugSession: FirefoxDebugSession): Variable {

		return VariableAdapter.getVariableFromGrip(varname, safeGetterValueDescriptor.getterValue, extendLifetime, debugSession);	
	}

	public static sortVariables(variables: Variable[]): void {
		variables.sort((var1, var2) => VariableAdapter.compareStrings(var1.name, var2.name));
	}
	
	private static compareStrings(s1: string, s2: string): number {
		if (s1 < s2) {
			return -1;
		} else if (s1 === s2) {
			return 0;
		} else {
			return 1;
		}
	}
}
