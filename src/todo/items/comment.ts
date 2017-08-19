
/* IMPORT */

import Item from './item';
import Project from './project';
import Todo from './todo';
import Consts from '../../consts';

/* COMMENT */

class Comment extends Item {

  static is ( str: string ) {

    return !Project.is ( str ) && !Todo.is ( str ) && super.is ( str, Consts.regexes.comment );

  }

}

/* EXPORT */

export default Comment;
