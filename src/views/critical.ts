
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Utils from '../utils';
import File from './items/file';
import Item from './items/item';
import Group from './items/group';
import Placeholder from './items/placeholder';
import Todo from './items/todo';
import View from './view';

/* FILES */

//TODO: Collapse/Expand without rebuilding the tree https://github.com/Microsoft/vscode/issues/54192

class Critical extends View {

  id = 'todo.views.3critical';
  clear = false;
  filePathRe = /^(?!~).*(?:\\|\/)/;

  getTreeItem ( item: Item ): vscode.TreeItem {
    return item
  }

  async getChildren ( item?: Item ): Promise<Item[]> {

    if ( this.clear ) {

      setTimeout ( this.refresh.bind ( this ), 0 );

      return [];

    }

    let obj = item ? item.obj : await Utils.files.get ();

    while ( obj && '' in obj ) obj = obj['']; // Collapsing unnecessary groups

    if ( _.isEmpty ( obj ) ) return [new Placeholder ( 'No todo files found' )];

    if ( obj.textEditor ) {

      const items = [],
            lineNr = obj.hasOwnProperty ( 'lineNr' ) ? obj.lineNr : -1;

      Utils.ast.walkChildren ( obj.textEditor, lineNr, data => {

        data.textEditor = obj.textEditor;
        data.filePath = obj.filePath;
        data.lineNr = data.line.lineNumber;

        let isDoing = data.line.text.includes("@critical") && !data.line.text.includes("@started") && !data.line.text.includes("@done");

        let isGroup = false;

        Utils.ast.walkChildren2 ( obj.textEditor, data.line.lineNumber, data => {
          if (data.line.text.includes("@critical") && !data.line.text.includes("@started") && !data.line.text.includes("@done")) {
            isGroup = true;
            return false;
          }
          return true;
      });

        if (isDoing || isGroup) {
          const label = _.trimStart ( data.line.text ),
              item = isGroup ? new Group ( data, label ) : new Todo ( data, label );
          items.push ( item );
        }
      });

      if ( !items.length ) { return []; }

      return items;

    } else {

      const keys = Object.keys ( obj ).sort ();

      return keys.map ( key => {

        const val = obj[key];

        if ( this.filePathRe.test ( key ) ) {

          const uri = Utils.view.getURI ( val );

          return new File ( val, uri );

        } else {

          return new Group ( val, key, this.config.embedded.view.icons );

        }

      });

    }

  }

  refresh ( clear? ) {

    this.clear = !!clear;

    super.refresh ();

  }

}

/* EXPORT */

export default new Critical ();
